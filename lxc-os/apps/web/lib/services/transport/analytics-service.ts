
import { prisma } from "@/lib/prisma";
import { BusMaintenanceAlertType, BehaviorSeverity } from "@prisma/client";
import { calculateDistance } from "./location-service";
import Logger from "../../utils/logger";

interface AnalyticsFilters {
  schoolId?: string;
  startDate?: Date;
  endDate?: Date;
  routeId?: string;
  busId?: string;
  driverId?: string;
}

export async function generateTransportAnalytics(
  schoolId: string,
  periodStart: Date,
  periodEnd: Date,
  periodType: "daily" | "weekly" | "monthly" | "yearly"
) {
  const [buses, routes, trips, students, drivers, incidents, performanceScores] = await Promise.all([
    prisma.bus.findMany({ where: { schoolId } }),
    prisma.route.findMany({ where: { schoolId } }),
    prisma.trip.findMany({
      where: {
        schoolId,
        startedAt: { gte: periodStart, lte: periodEnd },
      },
      include: {
        tripLocations: { orderBy: { timestamp: "asc" } },
        tripStops: true,
        bus: true,
        route: true,
      },
    }),
    prisma.student.findMany({
      where: { schoolId, busId: { not: null } },
    }),
    prisma.driver.findMany({ where: { schoolId } }),
    prisma.driverBehaviorIncident.findMany({
      where: {
        schoolId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.driverPerformanceScore.findMany({
      where: {
        schoolId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
    }),
  ]);

  const totalBuses = buses.length;
  const activeBuses = buses.filter((bus) =>
    trips.some((trip) => trip.busId === bus.id && trip.status === "ACTIVE")
  ).length;

  const totalRoutes = routes.length;
  const activeRoutes = routes.filter((route) =>
    trips.some((trip) => trip.routeId === route.id)
  ).length;

  let totalDistance = 0;
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
  }
  totalDistance = totalDistance / 1000;
  const averageRouteDistance = totalRoutes > 0 ? totalDistance / totalRoutes : 0;

  const totalTrips = trips.length;
  const completedTrips = trips.filter((t) => t.status === "COMPLETED").length;
  const onTimeTrips = trips.filter((trip) => {
    if (trip.tripStops.length === 0) return false;
    return trip.tripStops.every(
      (stop) =>
        stop.expectedArrival &&
        stop.actualArrival &&
        stop.actualArrival <= stop.expectedArrival
    );
  }).length;
  const delayedTrips = totalTrips - onTimeTrips;
  const onTimePercentage = totalTrips > 0 ? (onTimeTrips / totalTrips) * 100 : 0;

  const totalStudents = students.length;
  const busAttendance = await prisma.busAttendance.findMany({
    where: {
      busId: { in: buses.map((b) => b.id) },
      date: { gte: periodStart, lte: periodEnd },
    },
  });
  const studentsBoarded = busAttendance.filter((a) => a.status === "BOARDED").length;
  const studentsAlighted = busAttendance.filter((a) => a.status === "ALIGHTED").length;

  const averageBoardingTime = null;

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((driver) =>
    trips.some((trip) => trip.driverId === driver.id)
  ).length;
  const averageDriverScore =
    performanceScores.length > 0
      ? performanceScores.reduce((sum, score) => sum + score.overallScore, 0) /
      performanceScores.length
      : null;
  const totalIncidents = incidents.length;

  const busUtilization: { [busId: string]: number } = {};
  for (const bus of buses) {
    const busTrips = trips.filter((t) => t.busId === bus.id);
    const totalCapacity = bus.capacity * busTrips.length;
    const actualUsage = busAttendance.filter((a) => a.busId === bus.id).length;
    busUtilization[bus.id] = totalCapacity > 0 ? (actualUsage / totalCapacity) * 100 : 0;
  }
  const busUtilizationRate =
    Object.keys(busUtilization).length > 0
      ? Object.values(busUtilization).reduce((sum, rate) => sum + rate, 0) /
      Object.keys(busUtilization).length
      : 0;

  const fuelPricePerLiter = 100;
  const fuelEfficiency = 5;
  const estimatedFuelCost = (totalDistance / fuelEfficiency) * fuelPricePerLiter;
  const maintenanceCost = null;
  const totalCost = estimatedFuelCost + (maintenanceCost || 0);
  const costPerStudent = totalStudents > 0 ? (totalCost || 0) / totalStudents : 0;
  const costPerKm = totalDistance > 0 ? (totalCost || 0) / totalDistance : 0;

  const routeEfficiency: any = {};
  for (const route of routes) {
    const routeTrips = trips.filter((t) => t.routeId === route.id);
    if (routeTrips.length > 0) {
      let routeDistance = 0;
      let routeDuration = 0;
      let routeOnTime = 0;

      for (const trip of routeTrips) {
        if (trip.tripLocations.length > 1) {
          for (let i = 0; i < trip.tripLocations.length - 1; i++) {
            const loc1 = trip.tripLocations[i];
            const loc2 = trip.tripLocations[i + 1];
            routeDistance += calculateDistance(
              { latitude: loc1.latitude, longitude: loc1.longitude },
              { latitude: loc2.latitude, longitude: loc2.longitude }
            );
          }
        }
        if (trip.startedAt && trip.endedAt) {
          routeDuration += (trip.endedAt.getTime() - trip.startedAt.getTime()) / 1000;
        }
        if (
          trip.tripStops.every(
            (stop) =>
              stop.expectedArrival &&
              stop.actualArrival &&
              stop.actualArrival <= stop.expectedArrival
          )
        ) {
          routeOnTime++;
        }
      }

      const bus = buses.find(b => b.id === route.busId);
      const routeStudents = students.filter(s => s.routeId === route.id);

      routeEfficiency[route.id] = {
        routeId: route.id,
        routeName: route.name,
        totalTrips: routeTrips.length,
        totalDistance: routeDistance / 1000,
        averageDuration: routeDuration / routeTrips.length,
        onTimePercentage: (routeOnTime / routeTrips.length) * 100,
        occupancyRate: bus && bus.capacity > 0 ? (routeStudents.length / bus.capacity) * 100 : 0,
        studentCount: routeStudents.length,
      };
    }
  }

  const driverPerformance: any = {};
  for (const driver of drivers) {
    const driverTrips = trips.filter((t) => t.driverId === driver.id);
    const driverScore = performanceScores.find((s) => s.driverId === driver.id);
    const driverIncidents = incidents.filter((i) => i.driverId === driver.id);

    if (driverTrips.length > 0 || driverScore) {
      driverPerformance[driver.id] = {
        driverId: driver.id,
        driverName: (driver as any).user?.name || "Unknown",
        totalTrips: driverTrips.length,
        overallScore: driverScore?.overallScore || null,
        safetyScore: driverScore?.safetyScore || null,
        incidentsCount: driverIncidents.length,
      };
    }
  }

  const timeDistribution: { [hour: string]: number } = {};
  for (const trip of trips) {
    const hour = trip.startedAt.getHours();
    timeDistribution[hour.toString()] = (timeDistribution[hour.toString()] || 0) + 1;
  }

  const existing = await prisma.transportAnalytics.findFirst({
    where: {
      schoolId,
      periodStart,
      periodEnd,
      periodType,
    },
  });

  const analyticsData = {
    schoolId,
    periodStart,
    periodEnd,
    periodType,
    totalBuses,
    activeBuses,
    busUtilizationRate,
    totalRoutes,
    activeRoutes,
    totalDistance,
    averageRouteDistance,
    totalTrips,
    completedTrips,
    onTimeTrips,
    delayedTrips,
    onTimePercentage,
    totalStudents,
    studentsBoarded,
    studentsAlighted,
    averageBoardingTime,
    totalDrivers,
    activeDrivers,
    averageDriverScore,
    totalIncidents,
    estimatedFuelCost,
    maintenanceCost,
    totalCost,
    costPerStudent,
    costPerKm,
    routeEfficiency: routeEfficiency as any,
    driverPerformance: driverPerformance as any,
    timeDistribution: timeDistribution as any,
  };

  const analytics = existing
    ? await prisma.transportAnalytics.update({
      where: { id: existing.id },
      data: analyticsData,
    })
    : await prisma.transportAnalytics.create({
      data: analyticsData,
    });

  return analytics;
}

export async function getTransportAnalytics(
  schoolId: string,
  periodType?: "daily" | "weekly" | "monthly" | "yearly",
  limit?: number
) {
  const where: any = { schoolId };
  if (periodType) where.periodType = periodType;

  return prisma.transportAnalytics.findMany({
    where,
    orderBy: { periodStart: "desc" },
    take: limit || 100,
  });
}

export async function getBusUtilizationAnalytics(schoolId: string, filters?: AnalyticsFilters) {
  if (schoolId === undefined) {
    throw new Error("School ID is required");
  }
  const buses = await prisma.bus.findMany({
    where: { schoolId },
    include: {
      trips: {
        where: filters?.startDate || filters?.endDate
          ? {
            startedAt: {
              ...(filters.startDate ? { gte: filters.startDate } : {}),
              ...(filters.endDate ? { lte: filters.endDate } : {}),
            },
          }
          : undefined,
      },
      students: true,
    },
  });

  return buses.map((bus) => {
    const totalCapacity = bus.capacity * bus.trips.length;
    const currentOccupancy = bus.students.length;
    const utilizationPercentage = totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0;

    return {
      busId: bus.id,
      busNumber: bus.busNumber,
      capacity: bus.capacity,
      currentOccupancy,
      utilizationPercentage,
      totalTrips: bus.trips.length,
    };
  });
}

export async function getRouteEfficiencyMetrics(schoolId: string, filters?: AnalyticsFilters) {
  const routes = await prisma.route.findMany({
    where: { schoolId },
    include: {
      trips: {
        where: filters?.startDate || filters?.endDate
          ? {
            startedAt: {
              ...(filters.startDate ? { gte: filters.startDate } : {}),
              ...(filters.endDate ? { lte: filters.endDate } : {}),
            },
          }
          : undefined,
        include: {
          tripLocations: { orderBy: { timestamp: "asc" } },
          tripStops: true,
        },
      },
      busStops: true,
      students: true,
    },
  });

  return routes.map((route) => {
    let totalDistance = 0;
    let totalDuration = 0;
    let onTimeCount = 0;

    for (const trip of route.trips) {
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
      if (
        trip.tripStops.every(
          (stop) =>
            stop.expectedArrival &&
            stop.actualArrival &&
            stop.actualArrival <= stop.expectedArrival
        )
      ) {
        onTimeCount++;
      }
    }

    const avgDistance = route.trips.length > 0 ? totalDistance / route.trips.length / 1000 : 0;
    const avgDuration = route.trips.length > 0 ? totalDuration / route.trips.length : 0;
    const onTimePercentage = route.trips.length > 0 ? (onTimeCount / route.trips.length) * 100 : 0;

    return {
      routeId: route.id,
      routeName: route.name,
      totalStops: route.busStops.length,
      totalStudents: route.students.length,
      totalTrips: route.trips.length,
      averageDistance: avgDistance,
      averageDuration: avgDuration,
      onTimePercentage,
    };
  });
}

export async function generateMaintenanceAlerts(schoolId: string) {
  const buses = await prisma.bus.findMany({
    where: { schoolId },
    include: {
      trips: {
        where: { status: "COMPLETED" },
        include: {
          tripLocations: { orderBy: { timestamp: "asc" } },
        },
      },
    },
  });

  const alerts = [];

  for (const bus of buses) {
    let totalMileage = 0;
    for (const trip of bus.trips) {
      if (trip.tripLocations.length > 1) {
        for (let i = 0; i < trip.tripLocations.length - 1; i++) {
          const loc1 = trip.tripLocations[i];
          const loc2 = trip.tripLocations[i + 1];
          totalMileage += calculateDistance(
            { latitude: loc1.latitude, longitude: loc1.longitude },
            { latitude: loc2.latitude, longitude: loc2.longitude }
          );
        }
      }
    }
    totalMileage = totalMileage / 1000;

    const mileageThreshold = 10000;
    if (totalMileage > mileageThreshold) {
      const lastServiceMileage = totalMileage % mileageThreshold;
      if (lastServiceMileage > mileageThreshold * 0.9) {

        alerts.push({
          busId: bus.id,
          alertType: BusMaintenanceAlertType.MILEAGE_BASED,
          severity: lastServiceMileage > mileageThreshold * 0.95 ? BehaviorSeverity.HIGH : BehaviorSeverity.MEDIUM,
          title: "Mileage-based Maintenance Due",
          message: `Bus ${bus.busNumber} has reached ${totalMileage.toFixed(0)} km. Service recommended.`,
          currentMileage: totalMileage,
        });
      }
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentTrips = bus.trips.filter((t) => t.startedAt >= sixMonthsAgo);
    if (recentTrips.length === 0 && bus.trips.length > 0) {
      alerts.push({
        busId: bus.id,
        alertType: BusMaintenanceAlertType.TIME_BASED,
        severity: BehaviorSeverity.MEDIUM,
        title: "Time-based Maintenance Due",
        message: `Bus ${bus.busNumber} hasn't been serviced in 6+ months.`,
        daysSinceService: Math.floor(
          (Date.now() - bus.trips[0].startedAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      });
    }
  }

  for (const alert of alerts) {
    try {
      const existing = await prisma.busMaintenanceAlert.findFirst({
        where: {
          busId: alert.busId,
          alertType: alert.alertType,
          isResolved: false,
        },
      });

      if (existing) {
        await prisma.busMaintenanceAlert.update({
          where: { id: existing.id },
          data: {
            severity: alert.severity,
            message: alert.message,
            currentMileage: alert.currentMileage || null,
            daysSinceService: alert.daysSinceService || null,
          },
        });
      } else {
        await prisma.busMaintenanceAlert.create({
          data: {
            busId: alert.busId,
            schoolId,
            alertType: alert.alertType,
            severity: alert.severity,
            title: alert.title,
            message: alert.message,
            currentMileage: alert.currentMileage || null,
            daysSinceService: alert.daysSinceService || null,
          },
        });
      }
    } catch (error) {
      Logger.error(`Failed to create maintenance alert: ${error}`);
    }
  }

  return alerts;
}

export async function getMaintenanceAlerts(
  schoolId?: string,
  busId?: string,
  isAcknowledged?: boolean,
  isResolved?: boolean
) {
  const where: any = {};

  if (schoolId) where.schoolId = schoolId;
  if (busId) where.busId = busId;
  if (isAcknowledged !== undefined) where.isAcknowledged = isAcknowledged;
  if (isResolved !== undefined) where.isResolved = isResolved;

  return prisma.busMaintenanceAlert.findMany({
    where,
    include: {
      bus: true,
      school: true,
    },
    orderBy: [
      { severity: "desc" },
      { createdAt: "desc" },
    ],
  });
}
