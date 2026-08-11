import { NextApiRequest, NextApiResponse } from 'next';
import { SalaryService } from '@/lib/services/finance/SalaryService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { schoolId, startDate, endDate } = req.query;
  
  if (!startDate || !endDate) return res.status(400).json({ error: "Start and end dates required" });

  try {
    const payments = await SalaryService.getPaymentsByDateRange(
      new Date(startDate as string),
      new Date(endDate as string),
      schoolId as string // Optional
    );
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    return res.status(200).json({ total, payments });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
