
import { prisma } from "@/lib/prisma";
import { AttendanceStatus, AttendanceType } from "@prisma/client";
import { getInstitutionalToday, getInstitutionalNow, getISTHours, getISTMinutes } from "../../../utils/date-utils";

// Constants
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const LATE_THRESHOLD_MINUTES = 15;
const EARLY_EXIT_THRESHOLD_MINUTES = 30;
const OVERTIME_THRESHOLD_HOURS = 8;
const HALF_DAY_LATE_MINUTES = 120;

export class AttendanceService {
    private static getLateMinutes(punchIn: Date) {
        // Use IST hours to calculate lateness, not local server hours
        const punchHour = getISTHours(punchIn);
        const punchMinute = getISTMinutes(punchIn);
        const totalPunchMinutes = punchHour * 60 + punchMinute;
        const workStartMinutes = WORK_START_HOUR * 60;
        return Math.max(0, totalPunchMinutes - workStartMinutes);
    }

    private static calculateWorkingHours(punchIn: Date, punchOut: Date) {
        const diffMs = punchOut.getTime() - punchIn.getTime();
        return diffMs / (1000 * 60 * 60);
    }

    static async punchIn(data: { employeeId?: string; employeeCode?: string }) {
        const employee = await prisma.employee.findFirst({
            where: {
                OR: [{ id: data.employeeId }, { employeeCode: data.employeeCode }]
            }
        });

        if (!employee) throw new Error("Employee not found");
        if (employee.status !== "ACTIVE") throw new Error("Employee is not active");

        const today = getInstitutionalToday();

        const existing = await prisma.employeeAttendance.findUnique({
             where: { employeeId_date: { employeeId: employee.id, date: today } }
        });

        if (existing?.punchIn) throw new Error("Already punched in today");

        const punchInTime = getInstitutionalNow();
        const lateMinutes = this.getLateMinutes(punchInTime);
        const isLate = lateMinutes > LATE_THRESHOLD_MINUTES;

        let attendanceType: AttendanceType = AttendanceType.FULL_DAY;
        if (lateMinutes >= HALF_DAY_LATE_MINUTES) attendanceType = AttendanceType.HALF_DAY;

        return prisma.employeeAttendance.upsert({
            where: { employeeId_date: { employeeId: employee.id, date: today } },
            create: {
                employeeId: employee.id,
                date: today,
                punchIn: punchInTime,
                status: AttendanceStatus.PRESENT,
                isLateEntry: isLate,
                attendanceType,
                notes: isLate ? `Late entry by ${lateMinutes} minutes` : undefined
            },
            update: {
                punchIn: punchInTime,
                status: AttendanceStatus.PRESENT,
                isLateEntry: isLate,
                attendanceType,
                 notes: isLate
                  ? existing?.notes
                    ? `${existing.notes}; Late entry by ${lateMinutes} minutes`
                    : `Late entry by ${lateMinutes} minutes`
                  : existing?.notes,
            }
        });
    }

    static async punchOut(data: { employeeId?: string; employeeCode?: string }) {
        const employee = await prisma.employee.findFirst({
            where: {
                OR: [{ id: data.employeeId }, { employeeCode: data.employeeCode }]
            }
        });

        if (!employee) throw new Error("Employee not found");

        const today = getInstitutionalToday();

        const attendance = await prisma.employeeAttendance.findUnique({
              where: { employeeId_date: { employeeId: employee.id, date: today } }
        });

        if (!attendance) throw new Error("No punch in record found for today");
        if (attendance.punchOut) throw new Error("Already punched out today");
        if (!attendance.punchIn) throw new Error("Please punch in first");

        const punchOutTime = getInstitutionalNow();
        const workingHours = this.calculateWorkingHours(attendance.punchIn, punchOutTime);
        
        // Use IST hours for early exit detection
        const punchOutHour = getISTHours(punchOutTime);
        const punchOutMinute = getISTMinutes(punchOutTime);
        const punchOutTotalMinutes = punchOutHour * 60 + punchOutMinute;
        const workEndMinutes = WORK_END_HOUR * 60;
        const diffEarly = workEndMinutes - punchOutTotalMinutes;
        const isEarlyExit = diffEarly > EARLY_EXIT_THRESHOLD_MINUTES;

        const overtimeHours = Math.max(0, workingHours - OVERTIME_THRESHOLD_HOURS);
        
        let attendanceType = attendance.attendanceType;
        if (workingHours < 4) attendanceType = AttendanceType.HALF_DAY;

        return prisma.employeeAttendance.update({
            where: { 
                employeeId_date: { employeeId: employee.id, date: today }
            },
            data: {
                punchOut: punchOutTime,
                workingHours,
                isEarlyExit,
                overtimeHours: overtimeHours > 0 ? overtimeHours : null,
                attendanceType
            }
        });
    }

    static async getTodayAttendance(employeeId: string) {
        const today = getInstitutionalToday();
        return prisma.employeeAttendance.findUnique({
             where: { employeeId_date: { employeeId, date: today } },
             include: { employee: { include: { user: { select: { id: true, name: true, email: true, profilePic: true } } } } }
        });
    }

    static async getMonthlyAttendance(employeeId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return prisma.employeeAttendance.findMany({
            where: {
                employeeId,
                date: { gte: startDate, lte: endDate }
            },
            orderBy: { date: "asc" }
        });
    }

    static async getAttendanceHistory(employeeId: string, limit: number = 30, offset: number = 0) {
        const [data, total] = await Promise.all([
             prisma.employeeAttendance.findMany({
                 where: { employeeId },
                 orderBy: { date: "desc" },
                 take: limit,
                 skip: offset,
                 include: { employee: { include: { user: { select: { id: true, name: true, email: true } } } } }
             }),
             prisma.employeeAttendance.count({ where: { employeeId } })
        ]);
        return { data, total, limit, offset };
    }
}
