import { NextApiRequest, NextApiResponse } from "next";
import { ReceiptService } from "../../../../../../lib/services/finance/ReceiptService";
import { prisma } from "../../../../../../lib/prisma";
import { cors } from "../../../../../../lib/middleware/cors";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId as string }
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // If receipt already exists, redirect to it
    if (payment.receiptUrl) {
      return res.redirect(payment.receiptUrl);
    }

    // Otherwise generate it on the fly
    const { receiptUrl } = await ReceiptService.generateReceiptForPayment(paymentId as string);
    
    // Redirect to the newly generated receipt
    return res.redirect(receiptUrl);
  } catch (error: any) {
    console.error("Legacy Receipt Generate Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate receipt" });
  }
}
