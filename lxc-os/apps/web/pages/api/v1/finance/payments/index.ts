import { NextApiRequest, NextApiResponse } from 'next';
import { PaymentSettlementService } from '@/lib/services/finance/PaymentSettlementService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TODO: Auth Middleware
  const { schoolId, academicYearId, studentId, startDate, endDate } = req.query;

  if (!schoolId || typeof schoolId !== 'string') {
     return res.status(400).json({ error: "School ID required" });
  }
  
  // academicYearId might be needed for context, but Payment table doesn't have it strictly.
  // We will proceed with schoolId.

  try {
    const payments = await PaymentSettlementService.getPayments(
      schoolId, 
      academicYearId as string || '', // Optional in service for now
      {
        studentId: studentId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      }
    );
    return res.status(200).json(payments);
  } catch (error: any) {
    console.error("Get Payments Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
