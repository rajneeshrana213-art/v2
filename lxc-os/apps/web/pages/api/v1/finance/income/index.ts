import { NextApiRequest, NextApiResponse } from 'next';
import { IncomeService } from '@/lib/services/finance/IncomeService';
import { schoolIncomeSchema } from '@/lib/validations/finance/accounting';
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
      const incomes = await IncomeService.getIncomes(schoolId);
      return res.status(200).json(incomes);
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
            const uploadResult = await uploadFile(req.file.buffer, "finances/income", "auto", req.file.originalname);
            billUrl = uploadResult.url;
          }

          const result = schoolIncomeSchema.safeParse({
            ...req.body,
            billUrl
          });

          if (!result.success) {
            res.status(400).json({ error: result.error.errors });
            return resolve();
          }

          const income = await IncomeService.createIncome(result.data);
          res.status(201).json(income);
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
