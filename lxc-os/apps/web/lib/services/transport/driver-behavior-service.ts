
import { prisma } from "@/lib/prisma";
import { BehaviorIncidentType, BehaviorSeverity } from "@prisma/client";
import { calculateDistance } from "./location-service";
import Logger from "../../utils/logger";

const SPEED_LIMIT = 60;
const HARSH_BRAKING_THRESHOLD = -5;
const HARSH_ACCELERATION_THRESHOLD = 3;
const IDLE_TIME_THRESHOLD = 300;
const ROUTE_DEVIATION_THRESHOLD = 200;
const SPEED_VIOLATION_MARGIN = 5;

interface LocationData {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
}

interface PreviousLocation {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: Date;
}

export async function analyzeDriverBehavior(
  driverId: string,
  tripId: string | null,
  currentLocation: LocationData,
  previousLocation: PreviousLocation | null,
  routeId: string | null
) {
  const incidents: any[] = [];

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { school: true },
  });

  if (!driver) {
    throw new Error("Driver not found");
  }

  const schoolId = driver.schoolId;

  if (currentLocation.speed && currentLocation.speed > SPEED_LIMIT + SPEED_VIOLATION_MARGIN) {
    const severity = determineSpeedSeverity(currentLocation.speed, SPEED_LIMIT);
    incidents.push({
      type: BehaviorIncidentType.SPEED_VIOLATION,
      severity,
      speed: currentLocation.speed,
      threshold: SPEED_LIMIT,
      actualValue: currentLocation.speed,
      description: `Speed violation: ${currentLocation.speed.toFixed(1)} km/h (limit: ${SPEED_LIMIT} km/h)`,
    });
  }

  if (previousLocation && currentLocation.speed !== undefined && previousLocation.speed !== undefined) {
    const timeDiff = (currentLocation.timestamp.getTime() - previousLocation.timestamp.getTime()) / 1000;
    if (timeDiff > 0 && timeDiff < 10) {
      const speedDiff = currentLocation.speed - previousLocation.speed;
      const acceleration = (speedDiff / 3.6) / timeDiff;

      if (acceleration < HARSH_BRAKING_THRESHOLD) {
        incidents.push({
          type: BehaviorIncidentType.HARSH_BRAKING,
          severity: determineBrakingSeverity(acceleration),
          speed: currentLocation.speed,
          actualValue: acceleration,
          threshold: HARSH_BRAKING_THRESHOLD,
          description: `Harsh braking detected: ${acceleration.toFixed(2)} m/s²`,
        });
      }

      if (acceleration > HARSH_ACCELERATION_THRESHOLD) {
        incidents.push({
          type: BehaviorIncidentType.HARSH_ACCELERATION,
          severity: determineAccelerationSeverity(acceleration),
          speed: currentLocation.speed,
          actualValue: acceleration,
          threshold: HARSH_ACCELERATION_THRESHOLD,
          description: `Harsh acceleration detected: ${acceleration.toFixed(2)} m/s²`,
        });
      }
    }
  }

  if (routeId && currentLocation.latitude && currentLocation.longitude) {
    const deviation = await checkRouteDeviation(routeId, {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    });

    if (deviation && deviation.distance > ROUTE_DEVIATION_THRESHOLD) {
      incidents.push({
        type: BehaviorIncidentType.ROUTE_DEVIATION,
        severity: determineDeviationSeverity(deviation.distance),
        expectedRouteId: routeId,
        deviationDistance: deviation.distance,
        description: `Route deviation: ${deviation.distance.toFixed(0)}m from expected route`,
      });
    }
  }

  const recordedIncidents = [];
  for (const incident of incidents) {
    try {
      const recorded = await prisma.driverBehaviorIncident.create({
        data: {
          driverId,
          tripId,
          schoolId,
          type: incident.type,
          severity: incident.severity,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          speed: currentLocation.speed || null,
          heading: currentLocation.heading || null,
          description: incident.description,
          threshold: incident.threshold || null,
          actualValue: incident.actualValue || null,
          deviationDistance: incident.deviationDistance || null,
          expectedRouteId: incident.expectedRouteId || null,
        },
      });

      recordedIncidents.push(recorded);

      if (incident.severity === BehaviorSeverity.HIGH || incident.severity === BehaviorSeverity.CRITICAL) {
        await notifyAdminOfIncident(recorded, driver);
      }
    } catch (error) {
      Logger.error(`Failed to record behavior incident: ${error}`);
    }
  }

  return recordedIncidents;
}

export async function checkIdleTime(driverId: string, tripId: string | null) {
  const locations = await prisma.tripLocation.findMany({
    where: {
      tripId: tripId || undefined,
      trip: tripId
        ? undefined
        : {
            driverId,
            status: "ACTIVE",
          },
    },
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  if (locations.length < 2) return null;

  let idleStartTime: Date | null = null;
  let lastMovingTime: Date | null = null;

  for (let i = 0; i < locations.length - 1; i++) {
    const loc = locations[i];
    const prevLoc = locations[i + 1];

    const isMoving = (loc.speed || 0) > 5;
    const timeDiff = (loc.timestamp.getTime() - prevLoc.timestamp.getTime()) / 1000;

    if (!isMoving) {
      if (!idleStartTime) {
        idleStartTime = prevLoc.timestamp;
      }
    } else {
      if (idleStartTime) {
        const idleDuration = (loc.timestamp.getTime() - idleStartTime.getTime()) / 1000;
        if (idleDuration > IDLE_TIME_THRESHOLD) {
          const driver = await prisma.driver.findUnique({
            where: { id: driverId },
          });

          if (driver) {
            return await prisma.driverBehaviorIncident.create({
              data: {
                driverId,
                tripId,
                schoolId: driver.schoolId,
                type: BehaviorIncidentType.IDLE_TIME_EXCEEDED,
                severity: BehaviorSeverity.MEDIUM,
                latitude: loc.latitude,
                longitude: loc.longitude,
                speed: loc.speed || null,
                durationSeconds: Math.round(idleDuration),
                description: `Idle time exceeded: ${Math.round(idleDuration)}s (threshold: ${IDLE_TIME_THRESHOLD}s)`,
              },
            });
          }
        }
      }
      idleStartTime = null;
      lastMovingTime = loc.timestamp;
    }
  }

  return null;
}

export async function calculateDriverPerformanceScore(
  driverId: string,
  periodStart: Date,
  periodEnd: Date,
  periodType: "daily" | "weekly" | "monthly"
) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw new Error("Driver not found");
  }

  const trips = await prisma.trip.findMany({
    where: {
      driverId,
      startedAt: {
        gte: periodStart,
        lte: periodEnd,
      },
      status: "COMPLETED",
    },
    include: {
      tripLocations: {
        orderBy: { timestamp: "asc" },
      },
      tripStops: true,
    },
  });

  const incidents = await prisma.driverBehaviorIncident.findMany({
    where: {
      driverId,
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  });

  const totalTrips = trips.length;
  let totalDistance = 0;
  let totalDuration = 0;
  let onTimeCount = 0;

  for (const trip of trips) {
    if (trip.tripLocations.length > 1) {
      for (let i = 0; i < trip.tripLocations.length - 1; i++) {
        const loc1 = trip.tripLocations[i];
        const loc2 = trip.tripLocations[i + 1];
        totalDistance += calculateDistance(
          { latitude: loc1.latitude, longitude: loc1.longitude },
          { latitude: loc2.latitude, longitude: loc2.longitude }
        );
      }
    }

    if (trip.startedAt && trip.endedAt) {
      totalDuration += (trip.endedAt.getTime() - trip.startedAt.getTime()) / 1000;
    }

    if (trip.tripStops.length > 0) {
      const allOnTime = trip.tripStops.every(
        (stop) => stop.expectedArrival && stop.actualArrival && stop.actualArrival <= stop.expectedArrival
      );
      if (allOnTime) onTimeCount++;
    }
  }

  totalDistance = totalDistance / 1000;
  const onTimePercentage = totalTrips > 0 ? (onTimeCount / totalTrips) * 100 : 100;
  const incidentsCount = incidents.length;

  const averageSpeed =
    totalDuration > 0 ? (totalDistance / (totalDuration / 3600)) : null;

  const safetyScore = calculateSafetyScore(incidents, totalTrips);
  const punctualityScore = onTimePercentage;
  const efficiencyScore = calculateEfficiencyScore(totalDistance, totalDuration, trips.length);
  const complianceScore = calculateComplianceScore(incidents, totalTrips);

  const overallScore = (safetyScore + punctualityScore + efficiencyScore + complianceScore) / 4;

  const existing = await prisma.driverPerformanceScore.findFirst({
    where: {
      driverId,
      periodStart,
      periodEnd,
      periodType,
    },
  });

  const scoreData = {
    driverId,
    schoolId: driver.schoolId,
    periodStart,
    periodEnd,
    periodType,
    overallScore,
    safetyScore,
    punctualityScore,
    efficiencyScore,
    complianceScore,
    totalTrips,
    totalDistance,
    totalDuration: Math.round(totalDuration),
    incidentsCount,
    onTimePercentage,
    averageSpeed,
  };

  const score = existing
    ? await prisma.driverPerformanceScore.update({
        where: { id: existing.id },
        data: scoreData,
      })
    : await prisma.driverPerformanceScore.create({
        data: scoreData,
      });

  return score;
}

function determineSpeedSeverity(speed: number, limit: number): BehaviorSeverity {
  const overLimit = speed - limit;
  if (overLimit > 30) return BehaviorSeverity.CRITICAL;
  if (overLimit > 20) return BehaviorSeverity.HIGH;
  if (overLimit > 10) return BehaviorSeverity.MEDIUM;
  return BehaviorSeverity.LOW;
}

function determineBrakingSeverity(acceleration: number): BehaviorSeverity {
  if (acceleration < -8) return BehaviorSeverity.CRITICAL;
  if (acceleration < -6) return BehaviorSeverity.HIGH;
  return BehaviorSeverity.MEDIUM;
}

function determineAccelerationSeverity(acceleration: number): BehaviorSeverity {
  if (acceleration > 5) return BehaviorSeverity.CRITICAL;
  if (acceleration > 4) return BehaviorSeverity.HIGH;
  return BehaviorSeverity.MEDIUM;
}

function determineDeviationSeverity(distance: number): BehaviorSeverity {
  if (distance > 1000) return BehaviorSeverity.CRITICAL;
  if (distance > 500) return BehaviorSeverity.HIGH;
  return BehaviorSeverity.MEDIUM;
}

async function checkRouteDeviation(routeId: string, location: { latitude: number; longitude: number }) {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: { busStops: true },
  });

  if (!route || route.busStops.length === 0) return null;

  let minDistance = Infinity;
  for (const stop of route.busStops) {
    if (stop.latitude && stop.longitude) {
      const distance = calculateDistance(
        { latitude: stop.latitude, longitude: stop.longitude },
        location
      );
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
  }

  return minDistance < Infinity ? { distance: minDistance } : null;
}

function calculateSafetyScore(incidents: any[], totalTrips: number): number {
  if (totalTrips === 0) return 100;
  const criticalCount = incidents.filter((i: any) => i.severity === "CRITICAL").length;
  const highCount = incidents.filter((i: any) => i.severity === "HIGH").length;
  const mediumCount = incidents.filter((i: any) => i.severity === "MEDIUM").length;
  const lowCount = incidents.filter((i: any) => i.severity === "LOW").length;
  const penalty = criticalCount * 20 + highCount * 10 + mediumCount * 5 + lowCount * 2;
  return Math.max(0, 100 - penalty);
}

function calculateEfficiencyScore(distance: number, duration: number, tripCount: number): number {
  if (tripCount === 0 || duration === 0) return 100;
  const averageSpeed = (distance / (duration / 3600));
  const idealSpeed = 30;
  const speedRatio = averageSpeed / idealSpeed;
  if (speedRatio >= 0.8 && speedRatio <= 1.2) return 100;
  if (speedRatio >= 0.6 && speedRatio <= 1.5) return 80;
  if (speedRatio >= 0.4 && speedRatio <= 2.0) return 60;
  return 40;
}

function calculateComplianceScore(incidents: any[], totalTrips: number): number {
  if (totalTrips === 0) return 100;
  const violationCount = incidents.length;
  const violationRate = violationCount / totalTrips;
  if (violationRate === 0) return 100;
  if (violationRate < 0.1) return 90;
  if (violationRate < 0.2) return 75;
  if (violationRate < 0.3) return 60;
  return 40;
}

async function notifyAdminOfIncident(incident: any, driver: any) {
  try {
    await prisma.driverBehaviorIncident.update({
      where: { id: incident.id },
      data: {
        notifiedAdmin: true,
        notifiedAt: new Date(),
      },
    });
    Logger.warn(`Driver behavior incident: ${incident.type} for driver ${driver.id}`, {
      incidentId: incident.id,
      severity: incident.severity,
    });
  } catch (error) {
    Logger.error(`Failed to notify admin of incident: ${error}`);
  }
}

export async function getDriverBehaviorIncidents(
  driverId?: string,
  schoolId?: string,
  startDate?: Date,
  endDate?: Date,
  type?: BehaviorIncidentType
) {
  const where: any = {};
  if (driverId) where.driverId = driverId;
  if (schoolId) where.schoolId = schoolId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }
  if (type) where.type = type;

  return prisma.driverBehaviorIncident.findMany({
    where,
    include: {
      driver: { include: { user: true } },
      trip: { include: { route: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDriverPerformanceScores(
  driverId?: string,
  schoolId?: string,
  periodType?: string
) {
  const where: any = {};
  if (driverId) where.driverId = driverId;
  if (schoolId) where.schoolId = schoolId;
  if (periodType) where.periodType = periodType;

  return prisma.driverPerformanceScore.findMany({
    where,
    include: {
      driver: { include: { user: true } },
    },
    orderBy: { periodStart: "desc" },
  });
}
