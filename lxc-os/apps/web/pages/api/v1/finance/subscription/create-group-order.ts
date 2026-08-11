import { NextApiRequest, NextApiResponse } from "next";
import { razorpayInstance } from "../../../../../lib/config/razorpay";
import { prisma } from "../../../../../lib/prisma";
import { cors } from "../../../../../lib/middleware/cors";
import { withAuth } from "../../../../../lib/middleware/api-guard";
import { PaymentStatus } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { planId, groupId, billingPeriod } = req.body;

    if (!planId || !groupId) {
      return res.status(400).json({ message: "Missing required fields: planId, groupId" });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plan not found");

    const group = await prisma.schoolGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new Error("Group not found");

    const periodMultiplier = billingPeriod === "YEAR" ? 12 : 1;
    let baseAmount = plan.price * periodMultiplier;

    // Calculate GST (18%)
    const gstAmount = Number((baseAmount * 0.18).toFixed(2));
    const totalAmount = Number((baseAmount + gstAmount).toFixed(2));

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Payment gateway not configured" });
    }

    const orderOptions = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR" as const,
      receipt: `grp_${groupId.substring(0, 10)}_${Date.now()}`,
      notes: {
        groupId,
        planId,
        type: "group_plan_activation",
        billingPeriod: billingPeriod === "YEAR" ? "YEAR" : "MONTH",
      },
    };

    const order = await razorpayInstance.orders.create(orderOptions);

    await prisma.payment.create({
      data: {
        amount: totalAmount,
        razorpayOrderId: order.id,
        status: PaymentStatus.PENDING,
        planId, // Added for traceability
        description: `Group Upgrade to ${plan.name} (${billingPeriod === "YEAR" ? "Yearly" : "Monthly"})`,
      },
    });

    return res.status(201).json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      groupId,
      planId,
      baseAmount,
      gstAmount,
      totalAmount,
    });
  } catch (error: any) {
    console.error("Create group order error:", error);
    return res.status(400).json({ message: error.message || "Failed to create group order" });
  }
}

export default withAuth(handler);
