import { z } from "zod";
import { AssignmentStatus, HomeworkStatus } from "@prisma/client";

// --- Assignments ---
export const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.nativeEnum(AssignmentStatus).optional(),
  startDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  lessonId: z.string().cuid("Invalid lesson id"),
  classId: z.string().cuid("Invalid class id"),
  sectionId: z.string().cuid("Invalid section id"),
  subjectId: z.string().cuid("Invalid subject id"),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

// --- Homework ---
export const createHomeworkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  classId: z.string().cuid("Invalid class id"),
  subjectId: z.string().cuid("Invalid subject id"),
});

export const updateHomeworkSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  attachment: z.string().optional(),
  status: z.nativeEnum(HomeworkStatus).optional(),
  classId: z.string().cuid("Invalid class id").optional(),
  subjectId: z.string().cuid("Invalid subject id").optional(),
});

export const submitHomeworkSchema = z.object({
    studentId: z.string().cuid(),
    homeworkId: z.string().cuid(),
    file: z.string().optional(), // File URL managed by upload service
});

// --- Exams ---
export const createExamSchema = z.object({
  title: z.string().optional(), // Can be derived from type or explicit
  examType: z.string().optional(), // Custom field for grouping
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  scheduleDate: z.coerce.date().optional(), // For display if different from start
  totalMarks: z.coerce.number().optional().default(100),
  passMark: z.coerce.number().optional().default(35),
  roomNumber: z.coerce.number().optional(),
  classId: z.string().cuid(),
  subjectId: z.string().cuid(),
});

export const updateExamSchema = createExamSchema.partial();
