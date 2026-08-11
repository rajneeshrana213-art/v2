import { TripStatus } from "@prisma/client";
import { calculateDistance, isApproachingStop, hasArrivedAtStop, getDistanceToStop } from "./location-service";
import {
  notifyStopApproach,
  notifyStopArrival,
  notifyTripStarted,
  notifyTripEnded,
  sendNotification,
} from "../../services/notification/trip-notification-service";
import { analyzeDriverBehavior } from "./driver-behavior-service";
import Logger from "../../utils/logger";
import { prisma } from "@/lib/prisma";

const APPROACH_THRESHOLD = 300;
const ARRIVAL_THRESHOLD = 50;
const DEGRADATION_THRESHOLD = 90;

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

export async function startTrip(input: StartTripInput) {
  const { driverId, routeId, busId, schoolId, busStopIds } = input;

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { bus: true, user: true },
  });

  if (!driver) throw new Error("Driver not found");
  if (driver.busId !== busId) throw new Error("Driver is not assigned to this bus");

  const activeTrip = await prisma.trip.findFirst({
    where: { driverId, status: TripStatus.ACTIVE },
  });

  if (activeTrip) throw new Error("Driver already has an active trip");

  let route = null;
  if (routeId) {
    route = await prisma.route.findUnique({
      where: { id: routeId },
      include: { busStops: true },
    });
  }

  const trip = await prisma.trip.create({
    data: {
      driverId,
      routeId: routeId || null,
      busId,
      schoolId,
      status: TripStatus.ACTIVE,
      degraded: false,
    },
    include: {
      route: { include: { busStops: true } },
    },
  });

  if (route && route.busStops.length > 0) {
    await Promise.all(
      route.busStops.map(async (busStop) => {
        return prisma.tripStop.create({
          data: {
            tripId: trip.id,
            busStopId: busStop.id,
            latitude: busStop.latitude || 0,
            longitude: busStop.longitude || 0,
            notified: false,
            arrived: false,
          },
        });
      })
    );
  } else if (busStopIds && busStopIds.length > 0) {
    const busStops = await prisma.busStop.findMany({
      where: { id: { in: busStopIds } },
    });
    await Promise.all(
      busStops.map(async (busStop) => {
        return prisma.tripStop.create({
          data: {
            tripId: trip.id,
            busStopId: busStop.id,
            latitude: busStop.latitude || 0,
            longitude: busStop.longitude || 0,
            notified: false,
            arrived: false,
          },
        });
      })
    );
  }

  // Notify driver
  if (driver.user) {
    try {
      const recipient = driver.user.phone || driver.user.email;
      if (recipient) {
        await notifyTripStarted(trip.id, recipient, route?.name || "Unassigned Route");
      }
    } catch (error) {
      Logger.error("Failed to send trip started notification to driver", error);
    }
  }

  return trip;
}

export async function endTrip(tripId: string) {
  // Logic same as original
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { driver: { include: { user: true } }, route: true },
  });

  if (!trip) throw new Error("Trip not found");
  if (trip.status !== TripStatus.ACTIVE) throw new Error("Trip is not active");

  const updatedTrip = await prisma.trip.update({
    where: { id: tripId },
    data: { status: TripStatus.COMPLETED, endedAt: new Date() },
  });

  if (trip.driver?.user) {
    try {
      const recipient = trip.driver.user.phone || trip.driver.user.email;
      if (recipient) {
        await notifyTripEnded(tripId, recipient, trip.route?.name || "Unassigned Route");
      }
    } catch (error) {
      Logger.error("Failed to send trip ended notification", error);
    }
  }

  return updatedTrip;
}

export async function recordLocation(tripId: string, location: LocationInput) {
  const { latitude, longitude, speed, accuracy, heading, timestamp } = location;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      tripStops: {
        include: { busStop: true },
        where: { arrived: false },
        orderBy: { createdAt: "asc" },
      },
      route: { include: { busStops: true } },
    },
  });

  if (!trip) throw new Error("Trip not found");
  if (trip.status !== TripStatus.ACTIVE) throw new Error("Trip is not active");

  const previousLocation = await prisma.tripLocation.findFirst({
    where: { tripId },
    orderBy: { timestamp: "desc" },
  });

  await prisma.tripLocation.create({
    data: {
      tripId,
      latitude,
      longitude,
      speed: speed || null,
      accuracy: accuracy || null,
      heading: heading || null,
      timestamp: timestamp || new Date(),
    },
  });

  if (trip.driverId) {
    analyzeDriverBehavior(
      trip.driverId,
      tripId,
      {
        latitude,
        longitude,
        speed: speed || undefined,
        heading: heading || undefined,
        timestamp: timestamp || new Date(),
      },
      previousLocation
        ? {
            latitude: previousLocation.latitude,
            longitude: previousLocation.longitude,
            speed: previousLocation.speed || undefined,
            timestamp: previousLocation.timestamp,
          }
        : null,
      trip.routeId || null
    ).catch((error) => {
      Logger.error(`Failed to analyze driver behavior: ${error}`);
    });
  }

  await prisma.trip.update({
    where: { id: tripId },
    data: { updatedAt: new Date() },
  });

  const busLocation = { latitude, longitude };

  for (const tripStop of trip.tripStops) {
    const stopLocation = {
      latitude: tripStop.latitude,
      longitude: tripStop.longitude,
    };

    const distance = getDistanceToStop(busLocation, stopLocation);

    if (!tripStop.arrived && hasArrivedAtStop(busLocation, stopLocation, ARRIVAL_THRESHOLD)) {
      await prisma.tripStop.update({
        where: { id: tripStop.id },
        data: {
          arrived: true,
          arrivedAt: new Date(),
          actualArrival: new Date(),
        },
      });

      try {
        const students = await prisma.student.findMany({
          where: { busStopId: tripStop.busStopId },
          include: { user: true },
        });

        for (const student of students) {
          if (student.user) {
            const recipient = student.user.phone || student.user.email;
            if (recipient) {
              await notifyStopArrival(tripId, recipient, tripStop.busStop.name);
            }
          }
        }
      } catch (error) {
        Logger.error("Failed to send arrival notifications", error);
      }
    } else if (
      !tripStop.notified &&
      !tripStop.arrived &&
      isApproachingStop(busLocation, stopLocation, APPROACH_THRESHOLD)
    ) {
      await prisma.tripStop.update({
        where: { id: tripStop.id },
        data: { notified: true },
      });

      try {
        const students = await prisma.student.findMany({
          where: { busStopId: tripStop.busStopId },
          include: { user: true },
        });

        for (const student of students) {
          if (student.user) {
            const recipient = student.user.phone || student.user.email;
            if (recipient) {
              await notifyStopApproach(tripId, recipient, tripStop.busStop.name, distance);
            }
          }
        }
      } catch (error) {
        Logger.error("Failed to send approach notifications", error);
      }
    }
  }

  return { success: true };
}

export async function checkDegradedTrips() {
  const threshold = new Date(Date.now() - DEGRADATION_THRESHOLD * 1000);
  const activeTrips = await prisma.trip.findMany({
    where: { status: TripStatus.ACTIVE, degraded: false },
    include: {
      tripLocations: { orderBy: { timestamp: "desc" }, take: 1 },
    },
  });

  const degradedTrips: string[] = [];

  for (const trip of activeTrips) {
    const lastLocation = trip.tripLocations[0];
    const lastUpdate = lastLocation ? lastLocation.timestamp : trip.startedAt;

    if (lastUpdate < threshold) {
      await prisma.trip.update({
        where: { id: trip.id },
        data: { degraded: true },
      });
      degradedTrips.push(trip.id);
    }
  }

  return { degradedCount: degradedTrips.length, tripIds: degradedTrips };
}

export async function getTrip(tripId: string) {
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      driver: { include: { user: true } },
      bus: true,
      route: { include: { busStops: true } },
      tripStops: {
        include: { busStop: { include: { students: { include: { user: true } } } } },
      },
      tripLocations: { orderBy: { timestamp: "desc" }, take: 100 },
    },
  });
}

export async function getActiveTrips(driverId: string) {
  return prisma.trip.findMany({
    where: { driverId, status: TripStatus.ACTIVE },
    include: {
      bus: true,
      route: { include: { busStops: { orderBy: { createdAt: "asc" } } } },
      tripStops: {
        include: { busStop: { include: { students: { include: { user: true } } } } },
        orderBy: { createdAt: "asc" },
      },
      tripLocations: { orderBy: { timestamp: "desc" }, take: 1 },
    },
    orderBy: { startedAt: "desc" },
  });
}
