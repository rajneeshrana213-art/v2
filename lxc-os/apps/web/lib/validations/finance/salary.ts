import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const salaryPaymentSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  amount: z.number().positive("Amount must be positive"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Period must be YYYY-MM"), // Simple regex for now
  method: z.nativeEnum(PaymentMethod),
});

export const dateRangeQuerySchema = z.object({
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
});
