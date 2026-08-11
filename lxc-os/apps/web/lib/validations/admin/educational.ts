
import { z } from "zod";

// --- COMPETITION ---
export const createCompetitionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  userId: z.string().cuid("Invalid user id"),
  score: z.number().int().default(0),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateCompetitionSchema = z.object({
  name: z.string().min(1).optional(),
  score: z.number().int().optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const registerUserToCompetitionSchema = z.object({
  competitionId: z.string().cuid("Invalid competition id").optional(),
  competitionName: z.string().min(1, "Competition name is required").optional(),
  userId: z.string().cuid("Invalid user id"),
}).refine((data) => data.competitionId || data.competitionName, {
  message: "Either competitionId or competitionName must be provided",
});

export const submitResultSchema = z.object({
  competitionId: z.string().cuid("Invalid competition id"),
  userId: z.string().cuid("Invalid user id"),
  score: z.number().int().min(0, "Score must be non-negative"),
});

// --- PYQ ---
export const createPYQSchema = z.object({
  subjectId: z.string().cuid("Invalid subject id"),
  classId: z.string().cuid("Invalid class id"),
  uploaderId: z.string().cuid("Invalid uploader id"),
  // question/solution content handled possibly via file upload or rich text fields not shown in legacy validation
});

export const updatePYQSchema = z.object({
  subjectId: z.string().cuid("Invalid subject id").optional(),
  classId: z.string().cuid("Invalid class id").optional(),
});

// --- DOUBT & ANSWER ---
export const createDoubtSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  userId: z.string().cuid("Invalid user id"),
  classId: z.string().cuid("Invalid class id"),
  subjectId: z.string().cuid("Invalid subject id"),
});

export const updateDoubtSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

export const createAnswerSchema = z.object({
  content: z.string().min(1, "Content is required"),
  userId: z.string().cuid("Invalid user id"),
  doubtId: z.string().cuid("Invalid doubt id"),
});

export const updateAnswerSchema = z.object({
  content: z.string().min(1).optional(),
});

// --- LEADERBOARD ---
export const createLeaderboardSchema = z.object({
  userId: z.string().cuid("Invalid user id"),
  points: z.number().int(),
  coinsEarned: z.number().int(),
  rank: z.number().int(),
});

export const updateLeaderboardSchema = z.object({
  points: z.number().int().optional(),
  coinsEarned: z.number().int().optional(),
  rank: z.number().int().optional(),
});

// --- PROMOTION ---
export const promoteStudentSchema = z.object({
  studentId: z.string().cuid("Invalid student id"),
  fromClassId: z.string().cuid("Invalid from class id"),
  toClassId: z.string().cuid("Invalid to class id"),
  fromSection: z.string().min(1),
  toSection: z.string().min(1),
  academicYear: z.string().min(1),
  toSession: z.string().min(1),
});

export const bulkPromoteSchema = z.object({
  fromClassId: z.string().cuid("Invalid from class id"),
  toClassId: z.string().cuid("Invalid to class id"),
  fromSection: z.string().min(1),
  toSection: z.string().min(1),
  academicYear: z.string().min(1),
  toSession: z.string().min(1),
  excludeIds: z.array(z.string().cuid()).optional(),
});

export const selectivePromoteSchema = z.object({
  promotions: z.array(
    z.object({
      studentId: z.string().cuid("Invalid student id"),
      toClassId: z.string().cuid("Invalid to class id"),
      toSection: z.string().min(1),
      toSession: z.string().min(1),
    })
  ),
});
// --- CLASSES & SECTIONS ---
export const sectionSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, "Section name is required"),
  capacity: z.number().int().min(0, "Capacity must be non-negative").default(0),
});

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  roomNumber: z.string().optional(),
  sections: z.array(sectionSchema).optional(),
}).refine((data) => {
  if (!data.sections || data.sections.length === 0) return true;
  const totalSectionCapacity = data.sections.reduce((acc, s) => acc + (s.capacity || 0), 0);
  return totalSectionCapacity === data.capacity;
}, {
  message: "Total class capacity must equal the sum of section capacities",
  path: ["capacity"],
});

export const updateClassSchema = z.object({
  name: z.string().min(1, "Class name is required").optional(),
  capacity: z.number().int().min(1, "Capacity must be at least 1").optional(),
  roomNumber: z.string().optional(),
  sections: z.array(sectionSchema).optional(),
}).refine((data) => {
  if (!data.sections || data.sections.length === 0 || !data.capacity) return true;
  const totalSectionCapacity = data.sections.reduce((acc, s) => acc + (s.capacity || 0), 0);
  return totalSectionCapacity === data.capacity;
}, {
  message: "Total class capacity must equal the sum of section capacities",
  path: ["capacity"],
});

export const createSectionSchema = z.object({
  classId: z.string().cuid("Invalid class id"),
  name: z.string().min(1, "Section name is required"),
  capacity: z.number().int().min(0, "Capacity must be non-negative").default(0),
});

export const updateSectionSchema = z.object({
  name: z.string().min(1, "Section name is required").optional(),
  capacity: z.number().int().min(0, "Capacity must be non-negative").optional(),
});

export const bulkClassUploadSchema = z.array(z.object({
  className: z.string().min(1, "Class name is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  roomNumber: z.string().optional(),
  sections: z.array(z.object({
    name: z.string().min(1),
    capacity: z.number().int().min(0)
  })).optional(),
}));

// --- SUBJECTS ---
export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  type: z.string().min(1, "Subject type is required"), // e.g. Theory, Practical
  classId: z.string().cuid("Invalid class id"),
  status: z.nativeEnum(z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).enum).default("ACTIVE"),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").optional(),
  code: z.string().min(1, "Subject code is required").optional(),
  type: z.string().min(1, "Subject type is required").optional(),
  classId: z.string().cuid("Invalid class id").optional(),
  status: z.nativeEnum(z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).enum).optional(),
});

export const bulkSubjectUploadSchema = z.array(z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  type: z.string().min(1, "Subject type is required"),
  className: z.string().min(1, "Class name is required"),
}));
// --- LESSONS / TIMETABLE ---
export const createLessonSchema = z.object({
  day: z.nativeEnum(z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]).enum),
  startTime: z.string().datetime().or(z.date()),
  endTime: z.string().datetime().or(z.date()),
  subjectId: z.string().cuid("Invalid subject id"),
  classId: z.string().cuid("Invalid class id").optional(),
  classIds: z.array(z.string().cuid()).optional(),
  sectionId: z.string().cuid("Invalid section id").nullable().optional(),
  teacherId: z.string().cuid("Invalid teacher id").optional(),
});

export const bulkLessonSlotSchema = z.object({
  day: z.nativeEnum(z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]).enum),
  startTime: z.string(), // Expecting HH:mm
  endTime: z.string(),   // Expecting HH:mm
  subjectId: z.string().cuid("Invalid subject id"),
  teacherId: z.string().cuid("Invalid teacher id").optional(),
});

export const bulkCreateLessonSchema = z.object({
  classIds: z.array(z.string().cuid()).min(1, "At least one class is required"),
  lessons: z.array(bulkLessonSlotSchema).min(1, "At least one lesson slot is required"),
  sectionId: z.string().cuid().nullable().optional(),
});

export const updateLessonSchema = createLessonSchema.partial();
