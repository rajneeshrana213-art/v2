import { prisma } from "../../prisma";
import { TripStatus, TripType, BusAttendanceStatus } from "@prisma/client";

export const DriverService = {
  async getDashboardInfo(userId: string) {
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        bus: true,
        school: true,
        user: { select: { name: true, profilePic: true, email: true, phone: true } },
        trips: {
          where: { status: TripStatus.ACTIVE },
          include: {
            route: true,
            busAttendance: true,
          },
          take: 1,
        },
      },
    });

    if (!driver) throw new Error("Driver profile not found");

    const activeTrip = driver.trips[0] || null;

    // If no active trip, find the assigned route
    let route = null;
    if (driver.busId) {
      route = await prisma.route.findFirst({
        where: { busId: driver.busId },
      });
    }

    return {
      driverId: driver.id,
      busId: driver.busId,
      schoolId: driver.schoolId,
      driverName: driver.user.name,
      profilePic: driver.user.profilePic,
      email: driver.user.email,
      phone: driver.user.phone,
      license: driver.license,
      busNumber: driver.bus?.busNumber || "N/A",
      schoolName: driver.school.schoolName,
      activeTrip,
      assignedRoute: route,
    };
  },

  async startTrip(userId: string, routeId: string, type: TripType) {
    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) throw new Error("Driver not found");

    // End any existing active trips first (safety)
    await prisma.trip.updateMany({
      where: { driverId: driver.id, status: TripStatus.ACTIVE },
      data: { status: TripStatus.COMPLETED, endedAt: new Date() },
    });

    if (!driver.busId) throw new Error("Driver has no assigned bus");

    return prisma.trip.create({
      data: {
        driverId: driver.id,
        busId: driver.busId,
        routeId: routeId,
        schoolId: driver.schoolId,
        type: type,
        status: TripStatus.ACTIVE,
        startedAt: new Date(),
      },
    });
  },

  async endTrip(tripId: string) {
    return prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        endedAt: new Date(),
      },
    });
  },

  async getRouteStudents(routeId: string) {
    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        students: {
          include: {
            user: { select: { name: true } },
            busStop: true,
          },
        },
        busStops: {
          orderBy: { createdAt: "asc" }, // Or use an orderIndex if available
        },
      },
    });

    if (!route) throw new Error("Route not found");

    return route.students.map((s) => ({
      id: s.id,
      name: s.user.name,
      stopName: s.busStop?.name || "No Stop Assigned",
      parentPhone: "---", // In real DB, find parent phone
    }));
  },

  async updateStudentStatus(
    tripId: string,
    studentId: string,
    status: BusAttendanceStatus,
  ) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { busId: true },
    });

    if (!trip) throw new Error("Trip not found");

    // Use upsert or unique check for attendance on this date/bus
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.busAttendance.upsert({
      where: {
        studentId_tripId: {
          studentId,
          tripId,
        },
      },
      update: { status },
      create: {
        studentId,
        busId: trip.busId,
        tripId,
        status,
        date: today,
      },
    });
  },

  async getRouteStops(routeId: string) {
    try {
      return prisma.busStop.findMany({
        where: { routeId },
        orderBy: { createdAt: "asc" },
        include: {
          students: { select: { id: true } },
        },
      });
    } catch (error: any) {
      console.error("[DRIVER_OVERVIEW_ERROR]", error);
      throw new Error(error.message || "Internal server error"); // Re-throw for controller to handle
    }
  },
};
