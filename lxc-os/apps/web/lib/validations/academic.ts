import { z } from "zod";
import { ActiveStatus } from "@prisma/client";

// Class Schemas
export const createClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  capacity: z.coerce.number().int().positive().default(50),
  schoolId: z.string().cuid("Invalid school id"),
  section: z.string().optional(),
  roomNumber: z.string().optional(),
});

export const updateClassSchema = createClassSchema.partial();

export const assignTeacherSchema = z.object({
  classId: z.string().cuid("Invalid class id"),
  teacherId: z.string().cuid("Invalid teacher id"),
});

export const assignStudentSchema = z.object({
  classId: z.string().cuid("Invalid class id"),
  studentId: z.string().cuid("Invalid student id"),
});

// Section Schemas
export const createSectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  classId: z.string().cuid("Invalid class id"),
});

export const updateSectionSchema = createSectionSchema.partial();

// Subject Schemas
export const createSubjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  type: z.string().min(1, "Type is required"),
  classId: z.string().cuid("Invalid class id"),
  status: z.nativeEnum(ActiveStatus).optional().default("ACTIVE"),
});

export const updateSubjectSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  code: z.string().optional(),
  status: z.nativeEnum(ActiveStatus).optional(),
});
