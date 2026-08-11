import { z } from "zod";

export const collectPaymentSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["CASH", "CHEQUE", "UPI", "BANK_TRANSFER", "DD", "CARD"]),
  referenceNumber: z.string().optional(), // For Cheque/DD/Transaction ID
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  chequeDate: z.string().optional(), // ISO Date string
  remarks: z.string().optional(),
  shouldSendReceipt: z.boolean().optional().default(true),
});

export const createAdHocInvoiceSchema = z.object({
  studentId: z.string().min(1),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      amount: z.number().positive("Amount must be positive"),
      revenueAccountCode: z.string().optional(), // Optional: override default
    })
  ),
  dueDate: z.string().optional(), // ISO Date string
  remarks: z.string().optional(),
});

export const applyConcessionSchema = z.object({
  studentFeePlanId: z.string().min(1),
  feeHeadId: z.string().min(1).nullish(), // Optional/Null: specific fee head
  amount: z.number().min(0, "Amount must be zero or positive"),
  type: z.enum(["FIXED_AMOUNT", "PERCENTAGE", "FULL_WAIVER"]),
  reason: z.string().min(1, "Reason is required"),
  autoApprove: z.boolean().optional().default(false),
  schoolId: z.string().min(1),
  userId: z.string().min(1),
});

export const approveConcessionSchema = z.object({
  concessionId: z.string().min(1),
  approvedBy: z.string().min(1), // Admin user ID
});

export const reversePaymentSchema = z.object({
  paymentId: z.string().min(1),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export const sendDuesNotificationSchema = z.object({
  studentId: z.string().min(1),
  type: z.enum(["SMS", "WHATSAPP", "BOTH"]),
});

export const sendBulkDuesNotificationSchema = z.object({
  type: z.enum(["SMS", "WHATSAPP", "BOTH"]),
  minAmount: z.number().optional(), // Only notify if dues > minAmount
  classId: z.string().min(1).optional(), // Filter by class
});

export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "Start date must be before or equal to end date",
  path: ["startDate"],
});
