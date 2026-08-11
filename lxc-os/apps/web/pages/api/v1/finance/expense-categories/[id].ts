import { NextApiRequest, NextApiResponse } from 'next';
import { ExpenseService } from '@/lib/services/finance/ExpenseService';
import { expenseCategoryUpdateSchema } from '@/lib/validations/finance/accounting';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

  if (req.method === 'PUT') {
    try {
      const result = expenseCategoryUpdateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      const updated = await ExpenseService.updateCategory(id, result.data.name);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await ExpenseService.deleteCategory(id);
      return res.status(200).json({ message: "Category deleted" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
