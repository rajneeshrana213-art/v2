import { NextApiRequest, NextApiResponse } from 'next';
import { ExpenseService } from '@/lib/services/finance/ExpenseService';
import { schoolExpenseSchema } from '@/lib/validations/finance/accounting';
import upload from '@/lib/middleware/multer';
import { uploadFile } from '@/lib/config/upload';
import { verifyAuth } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { schoolId } = req.query;
    if (!schoolId || typeof schoolId !== 'string') {
      return res.status(400).json({ error: "School ID required" });
    }
    try {
      const expenses = await ExpenseService.getExpenses(schoolId);
      return res.status(200).json(expenses);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  } else if (req.method === 'POST') {
    return new Promise<void>((resolve) => {
      upload.single('bill')(req, res as any, async (err: any) => {
        if (err) {
          res.status(400).json({ error: "File upload error" });
          return resolve();
        }

        try {
          let billUrl = undefined;
          if (req.file) {
            const uploadResult = await uploadFile(req.file.buffer, "finances/expenses", "auto", req.file.originalname);
            billUrl = uploadResult.url;
          }

          const result = schoolExpenseSchema.safeParse({
            ...req.body,
            billUrl
          });

          if (!result.success) {
            res.status(400).json({ error: result.error.errors });
            return resolve();
          }

          const expense = await ExpenseService.createExpense(result.data);
          res.status(201).json(expense);
          resolve();
        } catch (error: any) {
          res.status(500).json({ error: error.message || "Internal Server Error" });
          resolve();
        }
      });
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
