import { prisma } from "@/lib/prisma";
import { BehaviorIncidentType, BehaviorSeverity } from "@prisma/client";
import { calculateDistance } from "@/lib/services/location-service";
import Logger from "@/lib/utils/logger";

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
  const driver = await prisma.driver.findUnique({ where: { id: driverId }, include: { school: true } });
  if (!driver) throw new Error("Driver not found");

  const schoolId = driver.schoolId;

  // 1. Speed
  if (currentLocation.speed && currentLocation.speed > SPEED_LIMIT + SPEED_VIOLATION_MARGIN) {
     incidents.push({
         type: BehaviorIncidentType.SPEED_VIOLATION,
         severity: determineSpeedSeverity(currentLocation.speed, SPEED_LIMIT),
         speed: currentLocation.speed,
         threshold: SPEED_LIMIT,
         description: `Speed: ${currentLocation.speed}`
     });
  }

  // 2. Harsh Braking/Accel
  if (previousLocation?.speed !== undefined && currentLocation.speed !== undefined) {
      const timeDiff = (currentLocation.timestamp.getTime() - previousLocation.timestamp.getTime()) / 1000;
      if (timeDiff > 0 && timeDiff < 10) {
          const accel = ((currentLocation.speed - previousLocation.speed) / 3.6) / timeDiff; // m/s²
          
          if (accel < HARSH_BRAKING_THRESHOLD) {
               incidents.push({
                   type: BehaviorIncidentType.HARSH_BRAKING,
                   severity: determineBrakingSeverity(accel),
                   speed: currentLocation.speed,
                   description: `Braking: ${accel}`
               });
          }
          if (accel > HARSH_ACCELERATION_THRESHOLD) {
               incidents.push({
                   type: BehaviorIncidentType.HARSH_ACCELERATION,
                   severity: determineAccelerationSeverity(accel),
                   speed: currentLocation.speed,
                   description: `Accel: ${accel}`
               });
          }
      }
  }

  // Record Incidents
  for (const inc of incidents) {
      try {
          await prisma.driverBehaviorIncident.create({
              data: {
                  driverId, tripId, schoolId,
                  type: inc.type,
                  severity: inc.severity,
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  speed: currentLocation.speed || null,
                  heading: currentLocation.heading || null,
                  description: inc.description,
                  threshold: inc.threshold || null,
              }
          });
      } catch (e) { Logger.error("Failed to record incident", e); }
  }
}

// Helpers
function determineSpeedSeverity(speed: number, limit: number): BehaviorSeverity {
  const diff = speed - limit;
  if (diff > 30) return BehaviorSeverity.CRITICAL;
  if (diff > 20) return BehaviorSeverity.HIGH;
  if (diff > 10) return BehaviorSeverity.MEDIUM;
  return BehaviorSeverity.LOW;
}

function determineBrakingSeverity(accel: number): BehaviorSeverity {
    if (accel < -8) return BehaviorSeverity.CRITICAL;
    if (accel < -6) return BehaviorSeverity.HIGH;
    return BehaviorSeverity.MEDIUM;
}

function determineAccelerationSeverity(accel: number): BehaviorSeverity {
    if (accel > 5) return BehaviorSeverity.CRITICAL;
    if (accel > 4) return BehaviorSeverity.HIGH;
    return BehaviorSeverity.MEDIUM;
}
