import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

// --- Attendance Services ---

export const markAttendanceService = async (data: { studentId: string; lessonId: string; present: boolean; date?: Date }) => {
    return await prisma.attendance.create({
        data: {
            studentId: data.studentId,
            lessonId: data.lessonId,
            present: data.present,
            status: data.present ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
            date: data.date || new Date(),
        }
    });
};

export const markMultipleAttendanceService = async (data: { lessonId: string; classId?: string; date?: Date; records: { studentId: string; present: boolean }[] }) => {
    const { lessonId, records, date } = data;
    const attendanceDate = date || new Date();

    return await prisma.$transaction(
        records.map(record => 
            prisma.attendance.create({
                data: {
                    studentId: record.studentId,
                    lessonId: lessonId,
                    present: record.present,
                    status: record.present ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
                    date: attendanceDate
                }
            })
        )
    );
};

export const getAttendanceReportData = async (schoolId: string, fromDate?: string, toDate?: string) => {
    const where: any = {
        student: { class: { schoolId } }
    };

    if (fromDate && toDate) {
        where.date = {
            gte: new Date(fromDate),
            lte: new Date(toDate)
        };
    }

    const records = await prisma.attendance.findMany({
        where,
        include: { student: { include: { user: { select: { name: true } } } } }
    });

    const summaryMap: Record<string, { present: number; absent: number }> = {};

    records.forEach(rec => {
        const name = rec.student.user.name;
        if (!summaryMap[name]) summaryMap[name] = { present: 0, absent: 0 };
        if (rec.present) summaryMap[name].present++;
        else summaryMap[name].absent++;
    });

    return Object.entries(summaryMap).map(([name, data]) => ({ name, ...data }));
};

export const getTeacherAttendanceStats = async (teacherId: string) => {
    if (!teacherId) return { totalDays: 0, presentDays: 0, absentDays: 0 };

    const [totalDays, presentDays, absentDays] = await Promise.all([
        prisma.teacherAttendance.count({ where: { teacherId } }),
        prisma.teacherAttendance.count({ where: { teacherId, status: AttendanceStatus.PRESENT } }),
        prisma.teacherAttendance.count({ where: { teacherId, status: AttendanceStatus.ABSENT } })
    ]);

    return { totalDays, presentDays, absentDays, lateDays: 0, halfDays: 0 };
};

// --- Leave Request Services ---

export const getTeacherStudentsLeaveRequests = async (teacherId: string) => {
    const classes = await prisma.class.findMany({
        where: { Teacher: { some: { id: teacherId } } },
        select: { id: true }
    });

    const classIds = classes.map(c => c.id);
    if (!classIds.length) return [];

    // Find students in these classes (optimized to get userIds directly)
    const students = await prisma.student.findMany({
        where: { classId: { in: classIds } },
        select: { userId: true }
    });
    
    const userIds = students.map(s => s.userId);
    if (!userIds.length) return [];

    return await prisma.leaveRequest.findMany({
        where: { userId: { in: userIds } },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
    });
};

export const getTeacherLeaveBalances = async (teacherId: string) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { userId: true }
    });
    
    if (!teacher) throw new Error("Teacher not found");

    const requests = await prisma.leaveRequest.findMany({
        where: { userId: teacher.userId },
        select: { status: true, fromDate: true, toDate: true, isApproved: true }
    });

    // Fix: Use strict type checking for approval status
    // Handle both string status and boolean isApproved fields properly
    // Note: Database schema may have isApproved as either boolean or string depending on migration state
    // This defensive check ensures compatibility with both types
    const approved = requests.filter(r => {
        // Check if status is APPROVED (string comparison)
        const statusApproved = r.status === "APPROVED";
        // Check if isApproved exists and is either boolean true or string "APPROVED"
        const isApprovedFlag = (r.isApproved as unknown) === true || r.isApproved === "APPROVED";
        return statusApproved || isApprovedFlag;
    });

    let totalUsed = 0;
    approved.forEach(r => {
        const diff = Math.abs(new Date(r.toDate).getTime() - new Date(r.fromDate).getTime());
        totalUsed += Math.ceil(diff / (1000 * 3600 * 24)) + 1;
    });

    // Mock logic for distribution - replicating controller logic
    const types = ["SICK", "CASUAL", "EARNED", "MATERNITY", "PATERNITY"];
    const balances: any = {};
    
    types.forEach(type => {
        const total = type === "SICK" ? 10 : type === "CASUAL" ? 12 : type === "EARNED" ? 15 : 5;
        const used = Math.floor(totalUsed / types.length); // Naive distribution from controller
        balances[type] = {
            total,
            used: Math.min(used, total),
            remaining: Math.max(0, total - used)
        };
    });

    return balances;
};
