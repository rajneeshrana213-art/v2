import { NextApiRequest, NextApiResponse } from 'next';
import { ExpenseService } from '@/lib/services/finance/ExpenseService';
import { expenseCategorySchema } from '@/lib/validations/finance/accounting';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { schoolId } = req.query;
    if (!schoolId || typeof schoolId !== 'string') {
      return res.status(400).json({ error: "School ID required" });
    }
    try {
      const categories = await ExpenseService.getCategories(schoolId);
      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const result = expenseCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      const category = await ExpenseService.createCategory(result.data);
      return res.status(201).json(category);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
