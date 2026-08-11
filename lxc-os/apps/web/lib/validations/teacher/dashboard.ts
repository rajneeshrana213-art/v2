
import { z } from "zod";
import { ActiveStatus } from "@prisma/client";

// --- CLASS ---
export const createClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  capacity: z.number().int().positive(),
  schoolId: z.string().cuid(),
  section: z.string().optional(),
  roomNumber: z.string().optional(),
});
export const updateClassSchema = createClassSchema.partial();

export const assignTeacherSchema = z.object({
  classId: z.string().cuid(),
  teacherId: z.string().cuid(),
});

// --- SECTION ---
export const createSectionSchema = z.object({
  name: z.string().min(1),
  classId: z.string().cuid(),
});
export const updateSectionSchema = createSectionSchema.partial();

// --- SUBJECT ---
export const createSubjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  type: z.string().min(1),
  classId: z.string().cuid(),
  status: z.nativeEnum(ActiveStatus).optional(),
});
export const updateSubjectSchema = createSubjectSchema.partial();

// --- LESSON ---
export const createLessonSchema = z.object({
  day: z.string().min(1), // Enum?
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  subjectId: z.string().cuid(),
  classId: z.string().cuid(),
  teacherId: z.string().cuid().optional(),
});
export const updateLessonSchema = createLessonSchema.partial();

// --- ASSIGNMENT & HOMEWORK ---
export const createAssignmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date(),
  attachment: z.string().optional(),
  lessonId: z.string().cuid(),
  classId: z.string().cuid(),
  sectionId: z.string().cuid().optional(),
  subjectId: z.string().cuid(),
});
export const updateAssignmentSchema = createAssignmentSchema.partial();

export const createHomeworkSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  classId: z.string().cuid(),
  subjectId: z.string().cuid(),
});
export const updateHomeworkSchema = createHomeworkSchema.partial();

// --- EXAM ---
export const createExamSchema = z.object({
  passMark: z.number().optional(),
  totalMarks: z.number().optional(),
  duration: z.number().min(1).optional(),
  roomNumber: z.number().min(1).optional(),
  title: z.string().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  subjectId: z.string().cuid(),
  classId: z.string().cuid(),
  examType: z.string().optional().default("CUSTOM"),
});
export const updateExamSchema = createExamSchema.partial();

// --- ATTENDANCE ---
export const attendanceSchema = z.object({
    studentId: z.string().cuid(),
    lessonId: z.string().cuid(),
    present: z.boolean(),
});

export const markMultipleAttendanceSchema = z.object({
    lessonId: z.string().cuid(),
    records: z.array(z.object({
        studentId: z.string().cuid(),
        present: z.boolean(),
    })).min(1),
});

// --- NEWSPAPER ---
export const createNewspaperSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    userId: z.string().cuid(),
    classId: z.string().cuid(),
});
export const updateNewspaperSchema = createNewspaperSchema.partial();
