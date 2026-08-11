import { z } from "zod";

export const submitHomeworkSchema = z.object({
  studentId: z.string().cuid("Invalid student id"),
  homeworkId: z.string().cuid("Invalid homework id"),
  file: z.string().min(1, "File URL is required"),
});

export const submitAssignmentSchema = z.object({
  studentId: z.string().cuid("Invalid student id"),
  assignmentId: z.string().cuid("Invalid assignment id"),
  file: z.string().optional()
});

export const viewHomeworkSchema = z.object({
  studentId: z.string().cuid("Invalid student id"),
  homeworkId: z.string().cuid("Invalid homework id"),
});

export const viewAssignmentSchema = z.object({
  studentId: z.string().cuid("Invalid student id"),
  assignmentId: z.string().cuid("Invalid assignment id"),
});
