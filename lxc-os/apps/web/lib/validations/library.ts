import { z } from "zod";
import { BookType } from "@prisma/client";

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  isbn: z.string().optional(),
  author: z.string().min(1, "Author is required"),
  publisher: z.string().optional(),
  language: z.string().optional().default("English"),
  publicationYear: z.number().int().optional(),
  description: z.string().optional(),
  type: z.nativeEnum(BookType).default(BookType.BOOK),
  categoryId: z.string().optional(),
  coverImage: z.string().optional(),
  libraryId: z.string().min(1, "Library ID is required"),
  quantity: z.number().int().min(1).default(1),
  price: z.number().min(0).optional().default(0),
  classId: z.string().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const issueBookSchema = z.object({
  bookCopyId: z.string().min(1, "Book Copy ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
});

export const createFineSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  amount: z.number().positive("Amount must be positive"),
  reason: z.string().min(1, "Reason is required"),
});

export const updateFineSchema = createFineSchema.partial();
