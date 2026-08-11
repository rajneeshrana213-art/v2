import { NextApiRequest, NextApiResponse } from 'next';
import { PaymentSettlementService } from '@/lib/services/finance/PaymentSettlementService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Payment ID required" });
  }

  try {
    const payment = await PaymentSettlementService.getPaymentById(id);
    if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
    }
    return res.status(200).json(payment);
  } catch (error: any) {
    console.error("Get Payment By ID Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
