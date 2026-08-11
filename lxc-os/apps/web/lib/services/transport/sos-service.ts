import { prisma } from "@/lib/prisma";
import { BehaviorSeverity } from "@prisma/client";

interface TriggerSOSInput {
  tripId?: string;
  driverId: string;
  schoolId: string;
  latitude?: number;
  longitude?: number;
  reason?: string;
}

export async function triggerSOS(input: TriggerSOSInput) {
  const { tripId, driverId, schoolId, latitude, longitude, reason } = input;

  const driver = await prisma.driver.findUnique({
    where: { userId: driverId },
    include: { user: true },
  });

  if (!driver) {
    throw new Error("Driver not found");
  }

  const incident = await prisma.driverBehaviorIncident.create({
    data: {
      driverId: driver.id,
      tripId: tripId || null,
      schoolId,
      type: "ROUTE_DEVIATION", // reuse existing enum without schema changes
      severity: BehaviorSeverity.CRITICAL,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      description: `SOS${reason ? `: ${reason}` : ""}`,
      threshold: null,
      actualValue: null,
      durationSeconds: null,
      expectedRouteId: null,
      deviationDistance: null,
      notifiedAdmin: false,
      notifiedAt: null,
    },
  });

  // TODO: integrate with existing notification system for admins & parents

  return incident;
}

export async function resolveSOS(incidentId: string) {
  const existing = await prisma.driverBehaviorIncident.findUnique({
    where: { id: incidentId },
  });

  if (!existing) {
    throw new Error("SOS incident not found");
  }

  const updated = await prisma.driverBehaviorIncident.update({
    where: { id: incidentId },
    data: {
      notifiedAdmin: true,
      notifiedAt: new Date(),
    },
  });

  return updated;
}

export async function listActiveSOS(schoolId: string) {
  if (!schoolId) throw new Error("schoolId is required");

  // Improved filtering: use 'contains' to catch all SOS incidents
  // This ensures we don't miss emergency types with different formats
  // Note: Using contains instead of startsWith for better coverage
  // Performance impact is acceptable for critical safety feature
  return prisma.driverBehaviorIncident.findMany({
    where: {
      schoolId,
      notifiedAdmin: false,
      description: {
        contains: "SOS",
      },
    },
    include: {
      driver: {
        include: {
          user: true,
        },
      },
      trip: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}


