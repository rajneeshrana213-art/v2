import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

export const attendanceSchema = z.object({
  studentId: z.string().cuid(),
  lessonId: z.string().cuid().optional(),
  date: z.coerce.date().optional(),
  present: z.boolean(),
  status: z.nativeEnum(AttendanceStatus).optional(),
});

export const markMultipleAttendanceSchema = z.object({
  lessonId: z.string().cuid(),
  classId: z.string().cuid().optional(), // Added for broader support
  date: z.coerce.date().optional(),
  records: z.array(
    z.object({
      studentId: z.string().cuid(),
      present: z.boolean(),
    })
  ),
});

export const updateAttendanceSchema = attendanceSchema.partial();
