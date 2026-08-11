
import { prisma } from "../prisma";
import Logger from "../utils/logger";
import { AttendanceStatus, AttendanceType } from "@prisma/client";
import { getInstitutionalToday, INSTITUTION_TIMEZONE } from "../utils/date-utils";

export async function runEmployeeAutoAbsent() {
  const startOfDay = getInstitutionalToday();
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const istDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: INSTITUTION_TIMEZONE }).format(startOfDay);
  Logger.info("[Employee Auto-Absent] Running for date:", {
    date: istDateStr,
  });

  try {
    const employees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, userId: true },
    });

    if (!employees.length) {
      return { message: "No active employees found" };
    }

    const todaysAttendance = await prisma.employeeAttendance.findMany({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
      },
      select: { employeeId: true },
    });

    const attendedSet = new Set(todaysAttendance.map((a) => a.employeeId));

    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        isApproved: "APPROVED",
        status: "APPROVED",
        fromDate: { lte: endOfDay },
        toDate: { gte: startOfDay },
      },
      select: { userId: true },
    });

    const onLeaveUserIds = new Set(approvedLeaves.map((l) => l.userId));

    const missingEmployees = employees.filter(
      (e) => !attendedSet.has(e.id) && !onLeaveUserIds.has(e.userId)
    );

    if (!missingEmployees.length) {
      return { message: "All employees have attendance" };
    }

    const data = missingEmployees.map((e) => ({
      employeeId: e.id,
      date: startOfDay,
      status: AttendanceStatus.ABSENT,
      attendanceType: AttendanceType.FULL_DAY,
      workingHours: 0,
      isLateEntry: false,
      isEarlyExit: false,
      overtimeHours: 0,
    }));

    const result = await prisma.employeeAttendance.createMany({
      data,
      skipDuplicates: true,
    });

    Logger.info("[Employee Auto-Absent] Marked employees absent:", {
      totalEmployees: employees.length,
      newlyMarkedAbsent: result.count,
    });

    return { success: true, markedAbsent: result.count };
  } catch (error: any) {
    Logger.error("[Employee Auto-Absent] Error:", error);
    throw error;
  }
}
