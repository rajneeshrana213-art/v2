import { prisma } from "@/lib/prisma";
import { TripStatus } from "@prisma/client";
import { getDistanceToStop, hasArrivedAtStop, isApproachingStop } from "./location-service";
import { notifyStopApproach, notifyStopArrival, notifyTripEnded, notifyTripStarted, sendNotification } from "./transport-notification";
import { analyzeDriverBehavior } from "./driver-behavior-service";
import Logger from "@/lib/utils/logger";

const APPROACH_THRESHOLD = 300; // meters
const ARRIVAL_THRESHOLD = 50; // meters

interface StartTripInput {
    driverId: string;
    routeId?: string;
    busId: string;
    schoolId: string;
    busStopIds?: string[];
}

interface LocationInput {
    latitude: number;
    longitude: number;
    speed?: number;
    accuracy?: number;
    heading?: number;
    timestamp?: Date;
}

export const TripService = {

    async startTrip(input: StartTripInput) {
        const { driverId, routeId, busId, schoolId, busStopIds } = input;

        // Verify driver and bus assignment
        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
            include: { bus: true, user: true }
        });
        if (!driver) throw new Error("Driver not found");
        if (driver.busId !== busId) throw new Error("Driver not assigned to this bus");

        // Check active trip
        const activeTrip = await prisma.trip.findFirst({
            where: { driverId, status: TripStatus.ACTIVE }
        });
        if (activeTrip) throw new Error("Driver already has an active trip");

        // Get Route
        let route = null;
        if (routeId) {
            route = await prisma.route.findUnique({
                where: { id: routeId },
                include: { busStops: true }
            });
        }

        // Create Trip
        const trip = await prisma.trip.create({
            data: {
                driverId, routeId: routeId || null, busId, schoolId,
                status: TripStatus.ACTIVE, degraded: false
            },
            include: { route: { include: { busStops: true } } }
        });

        // Create Trip Stops
        const stopsToCreate = route?.busStops || [];
        // Logic for custom busStopIds omitted for brevity in port, assuming Route-based operation primary. 
        // If busStopIds provided without route, would fetch them.

        if (stopsToCreate.length > 0) {
            await Promise.all(stopsToCreate.map(stop =>
                prisma.tripStop.create({
                    data: {
                        tripId: trip.id,
                        busStopId: stop.id,
                        latitude: stop.latitude || 0,
                        longitude: stop.longitude || 0,
                        notified: false, arrived: false
                    }
                })
            ));
        }

        // Notify Driver
        if (driver.user?.phone || driver.user?.email) {
            await notifyTripStarted(trip.id, (driver.user.phone || driver.user.email)!, route?.name || undefined);
        }

        // Notify Parents (Simplified batch notification)
        // TODO: Implement batch logic similar to original service

        return trip;
    },

    async endTrip(tripId: string) {
        const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { driver: { include: { user: true } }, route: true } });
        if (!trip) throw new Error("Trip not found");
        if (trip.status !== TripStatus.ACTIVE) throw new Error("Trip not active");

        const updated = await prisma.trip.update({
            where: { id: tripId },
            data: { status: TripStatus.COMPLETED, endedAt: new Date() }
        });

        if (trip.driver?.user) {
            await notifyTripEnded(trip.id, (trip.driver.user.phone || trip.driver.user.email)!, trip.route?.name || undefined);
        }
        return updated;
    },

    async recordLocation(tripId: string, location: LocationInput) {
        const { latitude, longitude, speed, heading, timestamp } = location;
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                tripStops: { where: { arrived: false }, include: { busStop: true } },
                route: true
            }
        });
        if (!trip || trip.status !== TripStatus.ACTIVE) throw new Error("Trip inactive or not found");

        // Get previous location
        const previousLocation = await prisma.tripLocation.findFirst({
            where: { tripId }, orderBy: { timestamp: 'desc' }
        });

        // Record Location
        const newLoc = await prisma.tripLocation.create({
            data: {
                tripId, latitude, longitude, speed, heading, timestamp: timestamp || new Date()
            }
        });

        // Analyze Behavior
        if (trip.driverId) {
            analyzeDriverBehavior(trip.driverId, tripId, {
                latitude, longitude, speed, heading, timestamp: timestamp || new Date()
            }, previousLocation ? {
                latitude: previousLocation.latitude, longitude: previousLocation.longitude, speed: previousLocation.speed || undefined, timestamp: previousLocation.timestamp
            } : null, trip.routeId).catch(err => Logger.error("Behavior Analysis Failed", err));
        }

        // Update Trip Last Updated
        await prisma.trip.update({ where: { id: tripId }, data: { updatedAt: new Date() } });

        // Stop Detection
        const busLoc = { latitude, longitude };
        for (const stop of trip.tripStops) {
            const stopLoc = { latitude: stop.latitude, longitude: stop.longitude };
            const distance = getDistanceToStop(busLoc, stopLoc);

            if (!stop.arrived && hasArrivedAtStop(busLoc, stopLoc, ARRIVAL_THRESHOLD)) {
                await prisma.tripStop.update({
                    where: { id: stop.id },
                    data: { arrived: true, arrivedAt: new Date(), actualArrival: new Date() }
                });
                // Notify
                // await notifyStopArrival(...) - Fetch students and notify
                Logger.info(`Trip ${tripId} arrived at ${stop.busStop.name}`);
            }
            else if (!stop.notified && !stop.arrived && isApproachingStop(busLoc, stopLoc, APPROACH_THRESHOLD)) {
                await prisma.tripStop.update({ where: { id: stop.id }, data: { notified: true } });
                // Notify
                // await notifyStopApproach(...)
                Logger.info(`Trip ${tripId} approaching ${stop.busStop.name}`);
            }
        }

        return { success: true };
    },

    async getActiveTrips(driverId: string) {
        return prisma.trip.findMany({
            where: { driverId, status: TripStatus.ACTIVE },
            include: { bus: true, route: { include: { busStops: true } }, tripStops: true }
        });
    },

    async getTrip(tripId: string) {
        return prisma.trip.findUnique({
            where: { id: tripId },
            include: { bus: true, driver: true, route: true, tripLocations: { take: 1, orderBy: { timestamp: 'desc' } } }
        });
    }
};
