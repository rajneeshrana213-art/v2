import { prisma } from "@/lib/prisma";
import { getInstitutionalToday, getInstitutionalEndOfDay } from "@/lib/utils/date-utils";


export interface TransportOverview {
  totalDrivers: number;
  totalVehicles: number;
  activeTrips: number;
  todayTrips: number;
  activeAlerts: number;
  lastUpdated: string;
}

export async function getTransportOverview(schoolId: string): Promise<TransportOverview> {
  if (!schoolId) {
    throw new Error("schoolId is required");
  }

  const startOfDay = getInstitutionalToday();     // IST midnight → correct UTC
  const endOfDay   = getInstitutionalEndOfDay();  // IST 23:59:59 → correct UTC


  const [totalDrivers, totalVehicles, activeTrips, todayTrips, activeAlerts] = await Promise.all([
    prisma.driver.count({ where: { schoolId } }),
    prisma.bus.count({ where: { schoolId } }),
    prisma.trip.count({
      where: {
        schoolId,
        status: "ACTIVE",
      },
    }),
    prisma.trip.count({
      where: {
        schoolId,
        startedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),
    // Treat high/critical driver incidents as active transport alerts (overspeed, deviation, etc.)
    prisma.driverBehaviorIncident.count({
      where: {
        schoolId,
        severity: {
          in: ["HIGH", "CRITICAL"],
        },
        notifiedAdmin: false,
      },
    }),
  ]);

  return {
    totalDrivers,
    totalVehicles,
    activeTrips,
    todayTrips,
    activeAlerts,
    lastUpdated: new Date().toISOString(),
  };
}


