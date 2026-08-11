
import { z } from "zod";
import { TodoStatus } from "@prisma/client";

// --- TICKET ---
export const ticketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  priority: z.string().min(1),
  status: z.string().min(1),
  schoolId: z.string().cuid().optional(),
  userId: z.string().cuid(),
  assignedToId: z.string().cuid().optional(),
  employeeId: z.string().cuid().optional(),
});

export const ticketUpdateSchema = ticketSchema.partial();
export const ticketIdParamSchema = z.object({ ticketId: z.string().cuid() });

// --- FEEDBACK ---
export const feedbackSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  schoolId: z.string().cuid(),
});
export const feedbackUpdateSchema = feedbackSchema.partial();
export const feedbackIdParamSchema = z.object({ feedbackId: z.string().cuid() });

// --- TODO ---
export const todoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.nativeEnum(TodoStatus),
  userId: z.string().cuid(),
  schoolId: z.string().cuid(),
});
export const todoUpdateSchema = todoSchema.partial();
export const todoIdParamSchema = z.object({ id: z.string().cuid() });

// --- CONTACT ---
export const contactMessageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  message: z.string().min(1),
  date: z.coerce.date().optional(),
  userId: z.string().cuid().optional(),
});
export const contactMessageIdParamSchema = z.object({ id: z.string().cuid() });

// --- FEATURES ---
export const featuresRequestListQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  status: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  schoolId: z.string().optional(),
  moduleName: z.string().optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "moduleName", "schoolName", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
