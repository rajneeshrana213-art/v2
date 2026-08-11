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

const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
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
  paymentMethod: z.enum(["CASH", "CHEQUE", "BANK_TRANSFER", "UPI", "CREDIT_CARD", "DEBIT_CARD", "ONLINE"]),
  invoiceNumber: z.string().optional(),
});

export default async function handler(req: any, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const authUser = await verifyAuth(req as NextApiRequest, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  switch (req.method) {
    case "GET":
      return handleGet(req, res, id);
    case "PUT":
      return handlePut(req, res, id);
    case "DELETE":
      return handleDelete(req, res, id);
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(req: any, res: NextApiResponse, id: string) {
  try {
    const income = await prisma.internalIncome.findUnique({
      where: { id },
    });

    if (!income) {
      return res.status(404).json({ message: "Income record not found" });
    }

    return res.status(200).json(income);
  } catch (error) {
    console.error("Error fetching income record:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handlePut(req: any, res: NextApiResponse, id: string) {
  try {
    await runMiddleware(req, res, upload.single("attachment"));

    const validationResult = incomeSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.errors,
      });
    }

    const data = validationResult.data;
    const existing = await prisma.internalIncome.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Income record not found" });
    }

    let attachmentUrl = existing.attachment;

    if (req.file) {
      const uploadResult = await uploadFile(req.file.buffer, "superadmin/finances/income", "auto", req.file.originalname);
      attachmentUrl = uploadResult.url;
    }

    const income = await prisma.internalIncome.update({
      where: { id },
      data: {
        source: data.source,
        date: data.date,
        amount: data.amount,
        description: data.description,
        paymentMethod: data.paymentMethod as any,
        attachment: attachmentUrl,
        invoiceNumber: data.invoiceNumber,
      },
    });

    return res.status(200).json(income);
  } catch (error) {
    console.error("Error updating income record:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleDelete(req: any, res: NextApiResponse, id: string) {
  try {
    await prisma.internalIncome.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Income record deleted successfully" });
  } catch (error) {
    console.error("Error deleting income record:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
