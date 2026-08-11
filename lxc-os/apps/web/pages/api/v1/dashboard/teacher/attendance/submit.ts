
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../lib/prisma";
import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "../../../../../../lib/middleware/cors";
import { getInstitutionalToday, isFutureDate, parseInstitutionalDate } from "../../../../../../lib/utils/date-utils";
import * as fcmTriggers from "@/lib/services/notification/fcm-trigger-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const { classId, students, date } = req.body;
    const user = (req as any).user;

    const teacher = await prisma.teacher.findFirst({
        where: { userId: user.id }
    });

    if (!teacher) {
        return res.status(404).json({ error: "Teacher record not found" });
    }

    // Attendance "date" must be treated as a calendar day in IST (NOT UTC).
    // getInstitutionalToday() already returns IST midnight as correct UTC — do NOT call setHours() after it.
    const attendanceDate = date ? parseInstitutionalDate(date) : getInstitutionalToday();


    if (isFutureDate(attendanceDate)) {
        return res.status(400).json({ error: "Cannot mark attendance for a future date" });
    }

    // We need a lessonId to link attendance (based on prisma schema)
    // For V1, we'll find or create a dummy lesson or link to the first lesson of the day for that class
    const lesson = await prisma.lesson.findFirst({
        where: { classId, teacherId: teacher.id }
    });

    if (!lesson) {
        return res.status(400).json({ error: "No lesson found for this teacher and class" });
    }

    const transactions = students.map((s: any) => 
        prisma.attendance.upsert({
            where: {
                studentId_lessonId_date: {
                    studentId: s.studentId,
                    lessonId: lesson.id,
                    date: attendanceDate
                }
            },
            update: {
                present: s.present,
                status: s.present ? "PRESENT" : "ABSENT"
            },
            create: {
                studentId: s.studentId,
                lessonId: lesson.id,
                date: attendanceDate,
                present: s.present,
                status: s.present ? "PRESENT" : "ABSENT"
            }
        })
    );

    await prisma.$transaction(transactions);

    // 🔔 Notify parents of absent students (fire-and-forget, never blocks response)
    const schoolId = (await prisma.teacher.findFirst({ where: { id: teacher.id }, select: { schoolId: true } }))?.schoolId;
    if (schoolId) {
      const absentStudentIds: string[] = (students as Array<{ studentId: string; present: boolean }>)
        .filter(s => !s.present)
        .map(s => s.studentId);
      for (const studentId of absentStudentIds) {
        fcmTriggers.notifyAttendanceMarked(studentId, "ABSENT", schoolId);
      }
    }

    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
