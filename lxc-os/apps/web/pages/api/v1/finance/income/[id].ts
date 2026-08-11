import { NextApiRequest, NextApiResponse } from 'next';
import { IncomeService } from '@/lib/services/finance/IncomeService';
import { schoolIncomeUpdateSchema } from '@/lib/validations/finance/accounting';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

  if (req.method === 'GET') {
    try {
      const income = await IncomeService.getIncomeById(id);
      if (!income) return res.status(404).json({ error: "Income not found" });
      return res.status(200).json(income);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const result = schoolIncomeUpdateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      const updated = await IncomeService.updateIncome(id, result.data);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await IncomeService.deleteIncome(id);
      return res.status(200).json({ message: "Income deleted" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
