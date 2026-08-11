/**
 * FCM Automated Trigger Service
 *
 * INTEGRATION CHEATSHEET
 * ──────────────────────
 * Homework created       → fcmTriggers.notifyHomeworkAssigned(classId, subject, dueDate, schoolId)
 * Exam results published → fcmTriggers.notifyResultDeclared(classId, examName, schoolId)
 * Fee invoice overdue    → fcmTriggers.notifyFeesDue(studentId, amount, dueDate, schoolId)
 * Trip starts            → fcmTriggers.notifyBusStarted(routeId, driverName, schoolId)
 * Location update        → fcmTriggers.checkBusGeofenceAndNotify(stopId, stopName, eta, schoolId)
 * Trip ends              → fcmTriggers.notifyBusStopped(routeId, schoolId)
 * Attendance absent      → fcmTriggers.notifyAttendanceMarked(studentId, "ABSENT", schoolId)
 * Notice published       → fcmTriggers.notifyNoticePublished(schoolId, title, targetRole)
 * Leave approved/rej     → fcmTriggers.notifyLeaveDecision(userId, status, schoolId)
 * Exam scheduled         → fcmTriggers.notifyExamScheduled(classId, examName, date, schoolId)
 * Timetable updated      → fcmTriggers.notifyTimetableChanged(classId, schoolId)
 * Payment confirmed      → fcmTriggers.notifyPaymentReceived(studentId, amount, schoolId)
 */

import { prisma } from "@/lib/prisma";
import * as FcmService from "./fcm-service";
import Logger from "@/lib/utils/logger";

// Cast to any so soft-delete extended client doesn't block new model access
const db = prisma as any;

// Fire-and-forget wrapper — never blocks the caller
async function fire(fn: () => Promise<unknown>, label: string) {
  try {
    await fn();
  } catch (err) {
    Logger.warn(`[FCM Trigger] ${label} failed silently`, { err });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get parent userIds for a student via the "ParentToStudent" relation */
async function getParentUserIds(studentId: string): Promise<string[]> {
  // Parent is linked to Student via many-to-many "ParentToStudent"
  // We query parents who have this student in their students[] array
  const parents = await db.parent.findMany({
    where: {
      students: { some: { id: studentId } },
    },
    select: { userId: true },
  });
  return parents
    .map((p: { userId: string | null }) => p.userId)
    .filter(Boolean) as string[];
}

/** Get student userIds for a given classId */
async function getClassStudentUserIds(classId: string, schoolId: string): Promise<string[]> {
  const students = await prisma.student.findMany({
    where: { classId, schoolId, isDeleted: false },
    select: { userId: true },
  });
  return students.map(s => s.userId);
}

// ─── 1. Homework Assigned ────────────────────────────────────────────────────

export function notifyHomeworkAssigned(
  classId:     string,
  subjectName: string,
  dueDate:     string,
  schoolId:    string
) {
  fire(async () => {
    const userIds = await getClassStudentUserIds(classId, schoolId);
    if (!userIds.length) return;

    await FcmService.sendToUsers(userIds, {
      title: "📚 New Homework Assigned",
      body:  `${subjectName} homework due by ${dueDate}. Don't miss it!`,
      data:  { screen: "homework", schoolId },
    }, schoolId, { trigger: "HOMEWORK_ASSIGNED" });
  }, "HOMEWORK_ASSIGNED");
}

// ─── 2. Result Declared ──────────────────────────────────────────────────────

export function notifyResultDeclared(
  classId:  string,
  examName: string,
  schoolId: string
) {
  fire(async () => {
    const userIds = await getClassStudentUserIds(classId, schoolId);
    if (!userIds.length) return;

    await FcmService.sendToUsers(userIds, {
      title: "📊 Results Declared",
      body:  `Your ${examName} results are now available. Tap to view!`,
      data:  { screen: "exams", schoolId },
    }, schoolId, { trigger: "RESULT_DECLARED" });
  }, "RESULT_DECLARED");
}

// ─── 3. Fees Due ─────────────────────────────────────────────────────────────

export function notifyFeesDue(
  studentId: string,
  amount:    number,
  dueDate:   string,
  schoolId:  string
) {
  fire(async () => {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
    if (!student) return;

    const parentUserIds = await getParentUserIds(studentId);
    const userIds = [student.userId, ...parentUserIds].filter(Boolean);

    await FcmService.sendToUsers(userIds as string[], {
      title: "💳 Fee Payment Reminder",
      body:  `₹${amount.toLocaleString("en-IN")} due by ${dueDate}. Pay now to avoid late fees.`,
      data:  { screen: "fees", schoolId, amount: String(amount) },
    }, schoolId, { trigger: "FEES_DUE" });
  }, "FEES_DUE");
}

// ─── 4. Payment Received ─────────────────────────────────────────────────────

export function notifyPaymentReceived(
  studentId: string,
  amount:    number,
  schoolId:  string
) {
  fire(async () => {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
    if (!student) return;

    const parentUserIds = await getParentUserIds(studentId);
    const userIds = [student.userId, ...parentUserIds].filter(Boolean);

    await FcmService.sendToUsers(userIds as string[], {
      title: "✅ Payment Confirmed",
      body:  `₹${amount.toLocaleString("en-IN")} received. Your fee receipt is ready.`,
      data:  { screen: "fees", schoolId },
    }, schoolId, { trigger: "PAYMENT_RECEIVED" });
  }, "PAYMENT_RECEIVED");
}

// ─── 5. Bus Started ──────────────────────────────────────────────────────────
// PickUpPoint → students → (use student userId, then find parent by ParentToStudent)

export function notifyBusStarted(
  routeId:    string,
  driverName: string,
  schoolId:   string
) {
  fire(async () => {
    // Get all students on this route's pickup points
    const pickups = await prisma.pickUpPoint.findMany({
      where:  { routeId },
      select: { students: { select: { id: true } } },
    });

    const studentIds = [...new Set(pickups.flatMap(p => p.students.map(s => s.id)))];
    if (!studentIds.length) return;

    const parentUserIds: string[] = [];
    for (const sid of studentIds) {
      const pids = await getParentUserIds(sid);
      parentUserIds.push(...pids);
    }
    const uniqueParentIds = [...new Set(parentUserIds)];
    if (!uniqueParentIds.length) return;

    await FcmService.sendToUsers(uniqueParentIds, {
      title: "🚌 Bus Has Started",
      body:  `Your child's bus (driver: ${driverName}) has started its route. Track live!`,
      data:  { screen: "bus", schoolId, routeId },
    }, schoolId, { trigger: "BUS_STARTED" });
  }, "BUS_STARTED");
}

// ─── 6. Bus Stopped ──────────────────────────────────────────────────────────

export function notifyBusStopped(routeId: string, schoolId: string) {
  fire(async () => {
    const pickups = await prisma.pickUpPoint.findMany({
      where:  { routeId },
      select: { students: { select: { id: true } } },
    });

    const studentIds = [...new Set(pickups.flatMap(p => p.students.map(s => s.id)))];
    const parentUserIds: string[] = [];
    for (const sid of studentIds) {
      parentUserIds.push(...(await getParentUserIds(sid)));
    }
    const uniqueParentIds = [...new Set(parentUserIds)];
    if (!uniqueParentIds.length) return;

    await FcmService.sendToUsers(uniqueParentIds, {
      title: "🏁 Bus Route Completed",
      body:  "Your child's bus has completed today's route.",
      data:  { screen: "bus", schoolId, routeId },
    }, schoolId, { trigger: "BUS_STOPPED" });
  }, "BUS_STOPPED");
}

// ─── 7. Bus Arriving at Stop ─────────────────────────────────────────────────
// BusStop has students[] directly (Student.busStopId FK)

export function notifyBusArriving(
  stopId:   string,
  stopName: string,
  eta:      string,
  schoolId: string
) {
  fire(async () => {
    const stop = await prisma.busStop.findUnique({
      where:  { id: stopId },
      select: { students: { select: { id: true } } },
    });
    if (!stop?.students?.length) return;

    const studentIds = stop.students.map(s => s.id);
    const parentUserIds: string[] = [];
    for (const sid of studentIds) {
      parentUserIds.push(...(await getParentUserIds(sid)));
    }
    const uniqueParentIds = [...new Set(parentUserIds)];
    if (!uniqueParentIds.length) return;

    await FcmService.sendToUsers(uniqueParentIds, {
      title: "🚌 Bus Arriving Soon",
      body:  `Bus arriving at ${stopName} in ~${eta}. Please be ready!`,
      data:  { screen: "bus", schoolId, stopId },
    }, schoolId, { trigger: "BUS_ARRIVING" });
  }, "BUS_ARRIVING");
}

// ─── 8. Attendance – absent/late only ────────────────────────────────────────

export function notifyAttendanceMarked(
  studentId: string,
  status:    "ABSENT" | "LATE",
  schoolId:  string
) {
  fire(async () => {
    const parentUserIds = await getParentUserIds(studentId);
    if (!parentUserIds.length) return;

    const studentRecord = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });

    // Fetch name from User model
    const user = studentRecord
      ? await db.user.findUnique({
          where: { id: studentRecord.userId },
          select: { name: true },
        })
      : null;
    const studentName = user?.name ?? "Your child";

    const label = status === "ABSENT" ? "is absent" : "was marked late";

    await FcmService.sendToUsers(parentUserIds, {
      title: status === "ABSENT" ? "⚠️ Attendance Alert" : "⏰ Late Attendance",
      body:  `${studentName} ${label} today. Please contact the school if needed.`,
      data:  { screen: "attendance", schoolId, studentId },
    }, schoolId, { trigger: `ATTENDANCE_${status}` });
  }, `ATTENDANCE_${status}`);
}

// ─── 9. Notice Published ─────────────────────────────────────────────────────

export function notifyNoticePublished(
  schoolId:   string,
  title:      string,
  targetRole: string // "student" | "teacher" | "parent" | "all"
) {
  fire(async () => {
    const roles = targetRole === "all"
      ? ["student", "teacher", "parent"]
      : [targetRole];

    for (const role of roles) {
      await FcmService.sendToRole(schoolId, role, {
        title: "📢 New Notice",
        body:  title,
        data:  { screen: "notices", schoolId },
      }, { trigger: "NOTICE_PUBLISHED" });
    }
  }, "NOTICE_PUBLISHED");
}

// ─── 10. Leave Decision ──────────────────────────────────────────────────────

export function notifyLeaveDecision(
  userId:   string,
  status:   "APPROVED" | "REJECTED",
  schoolId: string
) {
  fire(async () => {
    await FcmService.sendToUser(userId, {
      title: status === "APPROVED" ? "✅ Leave Request Approved" : "❌ Leave Request Rejected",
      body:  `Your leave request has been ${status.toLowerCase()} by the admin.`,
      data:  { screen: "leaves", schoolId },
    });
  }, "LEAVE_DECISION");
}

// ─── 11. Exam Scheduled ──────────────────────────────────────────────────────

export function notifyExamScheduled(
  classId:  string,
  examName: string,
  date:     string,
  schoolId: string
) {
  fire(async () => {
    const userIds = await getClassStudentUserIds(classId, schoolId);
    if (!userIds.length) return;

    await FcmService.sendToUsers(userIds, {
      title: "📝 Exam Scheduled",
      body:  `${examName} is scheduled on ${date}. Check your timetable!`,
      data:  { screen: "exams", schoolId },
    }, schoolId, { trigger: "EXAM_SCHEDULED" });
  }, "EXAM_SCHEDULED");
}

// ─── 12. Timetable Changed ───────────────────────────────────────────────────

export function notifyTimetableChanged(classId: string, schoolId: string) {
  fire(async () => {
    const studentUserIds = await getClassStudentUserIds(classId, schoolId);
    const teachers = await prisma.teacher.findMany({
      where: { schoolId, isDeleted: false },
      select: { userId: true },
    });
    const teacherUserIds = teachers.map(t => t.userId);

    const userIds = [...studentUserIds, ...teacherUserIds];
    if (!userIds.length) return;

    await FcmService.sendToUsers(userIds, {
      title: "🗓️ Timetable Updated",
      body:  "Your class timetable has been updated. Tap to see the latest schedule.",
      data:  { screen: "timetable", schoolId },
    }, schoolId, { trigger: "TIMETABLE_CHANGED" });
  }, "TIMETABLE_CHANGED");
}

// ─── 13. SOS Alert ───────────────────────────────────────────────────────────

export function notifySOS(
  driverName: string,
  routeId:    string,
  reason:     string,
  schoolId:   string
) {
  fire(async () => {
    // Notify all Admins of the school
    const admins = await prisma.user.findMany({
      where: { schoolId, role: "admin" },
      select: { id: true }
    });
    const userIds = admins.map(a => a.id);
    if (!userIds.length) return;

    await FcmService.sendToUsers(userIds, {
      title: "🚨 SOS ALERT!",
      body:  `Driver ${driverName} triggered SOS on Route ${routeId}. Reason: ${reason || "Not specified"}.`,
      data:  { screen: "bus", schoolId, routeId, type: "SOS" },
    }, schoolId, { trigger: "SOS_ALERT" });
  }, "SOS_ALERT");
}

// ─── 14. Assignment Assigned ──────────────────────────────────────────────────

export function notifyAssignmentAssigned(
  classId:     string,
  title:       string,
  dueDate:     string,
  schoolId:    string
) {
  fire(async () => {
    const userIds = await getClassStudentUserIds(classId, schoolId);
    if (!userIds.length) return;

    await FcmService.sendToUsers(userIds, {
      title: "📝 New Assignment",
      body:  `Assignment: ${title} is due by ${dueDate}.`,
      data:  { screen: "homework", schoolId },
    }, schoolId, { trigger: "ASSIGNMENT_ASSIGNED" });
  }, "ASSIGNMENT_ASSIGNED");
}

// ─── 15. Leave Applied ───────────────────────────────────────────────────────

export function notifyLeaveApplied(
  applicantName: string,
  role:          string,
  schoolId:      string
) {
  fire(async () => {
    // Notify all Admins of the school
    const admins = await prisma.user.findMany({
      where: { schoolId, role: "admin" },
      select: { id: true }
    });
    const userIds = admins.map(a => a.id);
    if (!userIds.length) return;

    await FcmService.sendToUsers(userIds, {
      title: "📝 New Leave Request",
      body:  `${applicantName} (${role}) has applied for leave. Tap to review.`,
      data:  { screen: "leaves", schoolId },
    }, schoolId, { trigger: "LEAVE_APPLIED" });
  }, "LEAVE_APPLIED");
}

// ─── 16. Admission/Registration Request ──────────────────────────────────────

export function notifyAdmissionRequest(
  studentName: string,
  schoolId:    string
) {
  fire(async () => {
    // Notify all Admins of the school
    const admins = await prisma.user.findMany({
      where: { schoolId, role: "admin" },
      select: { id: true }
    });
    const userIds = admins.map(a => a.id);
    if (!userIds.length) return;

    await FcmService.sendToUsers(userIds, {
      title: "🆕 New Admission Request",
      body:  `New registration request received for ${studentName}.`,
      data:  { screen: "registrations", schoolId },
    }, schoolId, { trigger: "ADMISSION_REQUEST" });
  }, "ADMISSION_REQUEST");
}
