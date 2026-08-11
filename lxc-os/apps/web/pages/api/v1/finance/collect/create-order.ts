import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { DashboardOptimizationService } from "@/lib/services/finance/DashboardOptimizationService";
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
    const { studentId, amount, schoolId, paymentMethod } = req.body;

    if (!studentId || !amount || !schoolId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ── Validate amount against actual pending balance ──────────────────────
    const activeAY = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
      select: { id: true }
    });

    if (activeAY) {
      const balances = await DashboardOptimizationService.getAllStudentBalances(
        schoolId,
        activeAY.id,
        [studentId]
      );
      const balance = balances.get(studentId);
      const pending = balance ? Math.max(0, balance.netBalance) : 0;

      if (pending <= 0) {
        return res.status(400).json({ error: "No pending fees found for this student." });
      }

      const minPayment = Math.ceil(pending * 0.20);

      if (amount > pending) {
        return res.status(400).json({
          error: `You cannot pay more than the pending amount (₹${pending.toLocaleString()}).`
        });
      }
      if (amount < minPayment) {
        return res.status(400).json({
          error: `Minimum payment is 20% of pending dues — ₹${minPayment.toLocaleString()}.`
        });
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    // Fetch School Specific Razorpay Keys
    const paymentSecret = await prisma.paymentSecret.findUnique({
      where: { schoolId },
    });

    if (!paymentSecret) {
      return res.status(400).json({ error: "Razorpay Not Configured for this school. Please contact support." });
    }

    const razorpay = new Razorpay({
      key_id: paymentSecret.keyId,
      key_secret: paymentSecret.keySecret,
    });

    // Calculate 2% transaction fee
    const transactionFee = Number((amount * 0.02).toFixed(2));
    const totalAmount = Number((amount + transactionFee).toFixed(2));

    const orderOptions = {
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: "INR",
      receipt: `fee_receipt_${Date.now()}`,
      notes: {
        studentId,
        schoolId,
        baseAmount: amount.toString(),
        transactionFee: transactionFee.toString(),
        paymentMethod
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Create a PENDING payment record
    await prisma.payment.create({
      data: {
        amount: totalAmount,
        razorpayOrderId: order.id,
        status: PaymentStatus.PENDING,
        schoolId,
        studentId,
        paymentMethod,
        description: `Fee Collection (Base: ${amount}, Fee: ${transactionFee})`,
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      transactionFee,
      baseAmount: amount,
      totalAmount,
      keyId: paymentSecret.keyId // Send the keyId for the frontend SDK
    });
  } catch (error: any) {
    console.error("Create Fee Order Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
