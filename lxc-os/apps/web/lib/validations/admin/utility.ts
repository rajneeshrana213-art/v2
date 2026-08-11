
import { z } from "zod";

// --- VISITOR ---
export const createVisitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional(),
  purpose: z.string().min(1, "Purpose is required"),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  schoolId: z.string().cuid("Invalid school id"),
});

export const verifyVisitorSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// --- TRANSACTION ---
export const createTransactionSchema = z.object({
  userId: z.string().cuid("Invalid user id"),
  coinsUsed: z.number().int(),
  amountPaid: z.number(),
  status: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  status: z.string().optional(),
});

// --- PAYMENT SECRET ---
export const createPaymentSecretSchema = z.object({
  keyId: z.string().min(1, "Key id is required"),
  keySecret: z.string().min(1, "Key secret is required"),
  schoolId: z.string().cuid("Invalid school id"),
});

export const updatePaymentSecretSchema = z.object({
  keyId: z.string().min(1).optional(),
  keySecret: z.string().min(1).optional(),
});

// --- MSG91 ---
export const msg91TemplateSchema = z.object({
    eventType: z.string().min(1),
    smsTemplateId: z.string().optional(),
    whatsappTemplateId: z.string().optional(),
    notificationType: z.string().optional(), // SMS, WHATSAPP, BOTH
});

// --- TEACHER FACE DATA ---
// Mostly handles file uploads, but if metadata needed:
export const registerTeacherFaceSchema = z.object({
    teacherId: z.string().cuid().optional(),
    teacherName: z.string().optional()
});
