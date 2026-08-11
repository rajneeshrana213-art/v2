import { z } from "zod";

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  schoolId: z.string().min(1, "School ID is required"),
});

export const expenseCategoryUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const dateValidation = (val: string | Date) => {
  const date = new Date(val);
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today
  
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(now.getDate() - 15);
  fifteenDaysAgo.setHours(0, 0, 0, 0); // Start of 15 days ago

  return date <= now && date >= fifteenDaysAgo;
};

const dateErrorMessage = "Date must be within the last 15 days and cannot be in the future";

export const schoolExpenseSchema = z.object({
  categoryId: z.string().optional(),
  newCategoryName: z.string().optional(),
  date: z.string().or(z.date()).refine(dateValidation, { message: dateErrorMessage }),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  billUrl: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'CHEQUE', 'NET_BANKING']),
  schoolId: z.string().min(1, "School ID is required"),
});

export const schoolExpenseUpdateSchema = z.object({
  categoryId: z.string().optional(),
  newCategoryName: z.string().optional(),
  date: z.string().or(z.date()).refine(dateValidation, { message: dateErrorMessage }),
  amount: z.coerce.number().positive(),
  description: z.string().min(1),
  billUrl: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'CHEQUE', 'NET_BANKING']),
});

export const schoolIncomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  date: z.string().or(z.date()).refine(dateValidation, { message: dateErrorMessage }),
  amount: z.coerce.number().positive(),
  description: z.string().min(1, "Description is required"),
  billUrl: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'CHEQUE', 'NET_BANKING']),
  schoolId: z.string().min(1, "School ID is required"),
});

export const schoolIncomeUpdateSchema = z.object({
  source: z.string().min(1),
  date: z.string().or(z.date()).refine(dateValidation, { message: dateErrorMessage }),
  amount: z.number().positive(),
  description: z.string().min(1),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'CHEQUE', 'NET_BANKING']),
});
