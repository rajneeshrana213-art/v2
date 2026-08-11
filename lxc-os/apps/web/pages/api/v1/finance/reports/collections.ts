import { NextApiRequest, NextApiResponse } from 'next';
import { PaymentSettlementService } from '@/lib/services/finance/PaymentSettlementService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { schoolId, startDate, endDate, classId, academicYearId } = req.query;
  
  if (!schoolId || typeof schoolId !== 'string') return res.status(400).json({ error: "School ID required" });
  if (!startDate || !endDate) return res.status(400).json({ error: "Start and end dates required" });

  try {
    const data = await PaymentSettlementService.getCollections(
      schoolId,
      new Date(startDate as string),
      new Date(endDate as string),
      classId as string,
      academicYearId as string
    );
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
