import { NextApiRequest, NextApiResponse } from "next";
import {prisma} from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { uploadFile } from "@/lib/config/upload";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const expenseSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().transform((val) => new Date(val)).refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
    fifteenDaysAgo.setHours(0, 0, 0, 0);
    return checkDate <= today && checkDate >= fifteenDaysAgo;
  }, "Date must be between 15 days ago and today"),
  amount: z.string().transform((val) => parseFloat(val)),
  description: z.string().optional(),
  paymentMethod: z.enum(["CASH", "CHEQUE", "BANK_TRANSFER", "UPI", "CREDIT_CARD", "DEBIT_CARD", "ONLINE"]).default("CASH"),
  invoiceNumber: z.string().optional(),
});

export default async function handler(req: any, res: NextApiResponse) {
  const authUser = await verifyAuth(req as NextApiRequest, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  if (req.method === "GET") {
    return handleGet(req, res);
  } else if (req.method === "POST") {
    return handlePost(req, res);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(req: any, res: NextApiResponse) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const where = {};

    const [expenses, totalItems, totalAmountResult] = await Promise.all([
      prisma.internalExpense.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.internalExpense.count({ where }),
      prisma.internalExpense.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalAmount = totalAmountResult._sum.amount || 0;

    return res.status(200).json({
      data: expenses,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("Error fetching internal expenses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handlePost(req: any, res: NextApiResponse) {
  try {
    await runMiddleware(req, res, upload.single("attachment"));

    const validationResult = expenseSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.errors,
      });
    }

    const data = validationResult.data;
    let attachmentUrl = null;

    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "superadmin/finances/expense", "auto", req.file.originalname);
      attachmentUrl = uploadResult.url;
    }

    const expense = await prisma.internalExpense.create({
      data: {
        categoryId: data.categoryId,
        date: data.date,
        amount: data.amount,
        description: data.description,
        paymentMethod: data.paymentMethod as any,
        attachment: attachmentUrl,
        invoiceNumber: data.invoiceNumber,
      },
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error("Error creating internal expense:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
