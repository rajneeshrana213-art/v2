import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { PaymentSettlementService } from "@/lib/services/finance/PaymentSettlementService";
import { ReceiptService } from "@/lib/services/finance/ReceiptService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentId,
      schoolId,
      academicYearId,
      userId,
      shouldSendReceipt
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !studentId || !schoolId || !userId) {
      return res.status(400).json({ error: "Missing required verification data" });
    }

    // 1. Fetch School Specific Razorpay Keys
    const paymentSecret = await prisma.paymentSecret.findUnique({
      where: { schoolId },
    });

    if (!paymentSecret) {
      return res.status(400).json({ error: "Razorpay Not Configured for this school" });
    }

    // 2. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", paymentSecret.keySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Find and update Payment status
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return res.status(200).json({ success: true, message: "Payment already processed", paymentId: payment.id });
    }

    // Update status to COMPLETED
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        razorpayPaymentId: razorpay_payment_id,
        paymentDate: new Date(),
      },
    });

    // Infer academic year if not provided
    let finalAcademicYearId = academicYearId;
    if (!finalAcademicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
        orderBy: { createdAt: "desc" },
      });
      if (!activeYear) {
        return res.status(400).json({ error: "Active academic year not found" });
      }
      finalAcademicYearId = activeYear.id;
    }

    // Calculate base amount for settlement (reversing the 2% fee)
    // Formula: Total = Base * 1.02 => Base = Total / 1.02
    const baseAmount = Number((payment.amount / 1.02).toFixed(2));
    
    // Settle the BASE amount against dues
    await PaymentSettlementService.settlePayment({
      schoolId,
      academicYearId: finalAcademicYearId,
      studentId,
      paymentAmount: baseAmount,
      paymentMethod: payment.paymentMethod || "ONLINE",
      paymentId: payment.id,
      createdBy: userId,
      description: `Online Fee Collection (Paid: ${payment.amount}, Base Settle: ${baseAmount})`,
    });

    // 🔄 Generate receipt (Puppeteer is slow — but we must ensure it completes)
    await ReceiptService.generateReceiptForPayment(payment.id, !!shouldSendReceipt)
      .catch((err) => console.error("Receipt generation failed:", err));

    // ✅ Respond after processing is complete
    res.status(200).json({
      success: true,
      paymentId: payment.id,
    });

  } catch (error: any) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
