
import { prisma } from "@/lib/prisma";
import { getFaceEmbedding, compareEmbeddings } from "../utils/face-matcher";
import { isWithinRadius } from "../utils/geo-fence";
import { uploadFile } from "../config/upload";
import {
  getInstitutionalToday,
  getInstitutionalEndOfDay,
  getInstitutionalNow,
  getISTHours,
  getISTDateString,
} from "../utils/date-utils";


const GEO_FENCE_RADIUS_METERS = 200;
const MAX_FAILED_ATTEMPTS_PER_DAY = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
function validateInputs(selfieBase64: string, latitude: number, longitude: number) {
  if (!selfieBase64 || selfieBase64.length < 500) {
    throw new Error("Invalid selfie image — image data is too small or empty");
  }

  const base64Body = selfieBase64.includes(",") ? selfieBase64.split(",")[1] : selfieBase64;
  const sizeBytes = Math.ceil((base64Body.length * 3) / 4);
  if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Selfie image is too large (max 5MB). Please try again.");
  }

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Invalid location coordinates");
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Location coordinates are out of valid range");
  }
}

const dailyFailMap = new Map<string, number>();

function failKey(teacherId: string): string {
  // Use IST date string so the daily reset aligns to IST midnight, not UTC midnight
  return `${teacherId}:${getISTDateString()}`;
}

function recordFailedAttempt(teacherId: string): void {
  const key = failKey(teacherId);
  dailyFailMap.set(key, (dailyFailMap.get(key) ?? 0) + 1);
}

function getFailedAttempts(teacherId: string): number {
  return dailyFailMap.get(failKey(teacherId)) ?? 0;
}

function clearFailedAttempts(teacherId: string): void {
  dailyFailMap.delete(failKey(teacherId));
}

// ─── Public status helper (used by /api/v1/attendance/status) ─────────────────
export async function getTeacherAttendanceStatus(userId: string) {
  const teacher = await prisma.teacher.findFirst({ 
    where: { userId },
    include: { TeacherFaceData: true } 
  });
  if (!teacher) return null;

  const todayStart = getInstitutionalToday();     // IST midnight → correct UTC
  const todayEnd   = getInstitutionalEndOfDay();  // IST 23:59:59 → correct UTC

  const existingToday = await prisma.teacherAttendance.findFirst({
    where: { teacherId: teacher.id, attendanceDate: { gte: todayStart, lte: todayEnd }, status: "PRESENT" },
  });

  const failed = getFailedAttempts(teacher.id);
  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS_PER_DAY - failed);

  return {
    markedToday: !!existingToday,
    faceRegistered: !!teacher.TeacherFaceData,
    attemptsUsed: failed,
    attemptsRemaining: remaining,
    maxAttempts: MAX_FAILED_ATTEMPTS_PER_DAY,
    isLocked: failed >= MAX_FAILED_ATTEMPTS_PER_DAY,
  };
}


export class AttendanceService {
  static async markTeacherAttendance(
    userId: string,
    data: { selfieBase64: string; latitude: number; longitude: number }
  ) {
    const { selfieBase64, latitude, longitude } = data;

    validateInputs(selfieBase64, latitude, longitude);


    const teacher = await prisma.teacher.findFirst({
      where: { userId },
      include: { TeacherFaceData: true },
    });

    if (!teacher) throw new Error("Teacher not found");
    if (!teacher.TeacherFaceData) {
      throw new Error("No face model registered for your account. Please contact your admin.");
    }

    const failedToday = getFailedAttempts(teacher.id);
    if (failedToday >= MAX_FAILED_ATTEMPTS_PER_DAY) {
      throw new Error(
        `Too many failed attempts today (${failedToday}/${MAX_FAILED_ATTEMPTS_PER_DAY}). Access locked until midnight. Contact your admin if this is a mistake.`
      );
    }

    const todayStart = getInstitutionalToday();     // IST midnight → correct UTC
    const todayEnd   = getInstitutionalEndOfDay();  // IST 23:59:59 → correct UTC

    const existing = await prisma.teacherAttendance.findFirst({
      where: {
        teacherId: teacher.id,
        attendanceDate: { gte: todayStart, lte: todayEnd },
        status: "PRESENT",
      },
    });
    if (existing) {
      throw new Error("Attendance already marked for today");
    }

    const faceData = teacher.TeacherFaceData;

    const registeredLat = faceData.latitude;
    const registeredLon = faceData.longitude;
    const geoFenceSkipped = registeredLat == null || registeredLon == null;
    const insideGeoFence =
      !geoFenceSkipped &&
      isWithinRadius(latitude, longitude, registeredLat!, registeredLon!, GEO_FENCE_RADIUS_METERS);

    if (!insideGeoFence && !geoFenceSkipped) {
      recordFailedAttempt(teacher.id);
      throw new Error("Outside school premises — you must be within 200m of your registered location");
    }


    let liveEmbedding: string;
    let verificationLatencyMs: number;
    try {
      const result = await getFaceEmbedding(selfieBase64);
      liveEmbedding = result.embedding;
      verificationLatencyMs = result.latencyMs;
    } catch (err: any) {
      recordFailedAttempt(teacher.id);
      throw err;
    }

    const { matched: faceMatched, score } = await compareEmbeddings(
      liveEmbedding,
      faceData.faceEmbedding as Buffer
    );

    console.info(`[Attendance] Teacher ${teacher.id} | face_score=${score} | latency=${verificationLatencyMs}ms | geo_ok=${insideGeoFence || geoFenceSkipped}`);

    if (!faceMatched) {
      recordFailedAttempt(teacher.id);
      const remaining = MAX_FAILED_ATTEMPTS_PER_DAY - getFailedAttempts(teacher.id);
      throw new Error(`Face verification failed. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining today.`);
    }

    let selfieImageUrl: string | null = null;
    try {
      const base64Body = selfieBase64.includes(",") ? selfieBase64.split(",")[1] : selfieBase64;
      const buffer = Buffer.from(base64Body, "base64");
      const { url } = await uploadFile(
        buffer,
        "teacher-attendance-selfies",
        "image",
        `${teacher.id}_${Date.now()}.jpg`
      );
      selfieImageUrl = url;
    } catch (uploadErr) {
      console.warn("[Attendance] Selfie upload failed (non-fatal):", uploadErr);
    }

    // Use IST-aware helpers so noon comparison is correct on Vercel (UTC server)
    const now = getInstitutionalNow();
    const istHour = getISTHours(now);
    const type = istHour >= 12 ? "HALF_DAY" : "FULL_DAY";

    await (prisma.teacherAttendance.create as any)({
      data: {
        teacherId: teacher.id,
        latitude,
        longitude,
        matched: true,
        type,
        status: "PRESENT",
        attendanceDate: todayStart,
        attendanceTime: now,
        selfieImageUrl,
        verificationLatencyMs,
      },
    });


    clearFailedAttempts(teacher.id);

    return {
      message: "Attendance marked successfully",
      verificationLatencyMs,
      score,
      selfieImageUrl,
    };
  }
}
