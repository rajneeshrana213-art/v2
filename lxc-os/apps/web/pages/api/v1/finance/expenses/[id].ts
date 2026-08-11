import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ExpenseService } from '@/lib/services/finance/ExpenseService';
import { schoolExpenseUpdateSchema } from '@/lib/validations/finance/accounting';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

  if (req.method === 'GET') {
    try {
      const expense = await ExpenseService.getExpenseById(id);
      if (!expense) return res.status(404).json({ error: "Expense not found" });
      return res.status(200).json(expense);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!(session?.user as any)?.schoolId) return res.status(401).json({ error: "Unauthorized" });

      const result = schoolExpenseUpdateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      const updated = await ExpenseService.updateExpense(id, {
        ...result.data,
        schoolId: (session as any).user.schoolId
      });
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await ExpenseService.deleteExpense(id);
      return res.status(200).json({ message: "Expense deleted" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
