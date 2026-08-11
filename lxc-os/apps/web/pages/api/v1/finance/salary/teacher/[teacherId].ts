import { NextApiRequest, NextApiResponse } from 'next';
import { SalaryService } from '@/lib/services/finance/SalaryService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { teacherId } = req.query;
  if (!teacherId || typeof teacherId !== 'string') return res.status(400).json({ error: "Teacher ID required" });

  if (req.method === 'GET') {
    try {
      const payments = await SalaryService.getTeacherPayments(teacherId);
      return res.status(200).json(payments);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
