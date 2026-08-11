import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { razorpayInstance } from "../../../../../lib/config/razorpay";
import { cors } from "../../../../../lib/middleware/cors";
import { withAuth } from "../../../../../lib/middleware/api-guard";
import { PaymentStatus } from "@prisma/client";
import { getGlobalSettingsByGroup } from "../../../../../lib/cache/globalSettings";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { schoolId, quantity } = req.body;

  if (!schoolId || !quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ message: "Missing required fields: schoolId, quantity" });
  }

  try {
    const config = await prisma.schoolSubscriptionConfig.findUnique({
      where: { schoolId },
    });

    if (!config) {
      return res
        .status(404)
        .json({ message: "Subscription configuration not found" });
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: { schoolId, isActive: true },
      orderBy: { endDate: "desc" },
    });

    let remainingDays = 0;
    if (activeSubscription) {
      const now = new Date();
      const endDate = new Date(activeSubscription.endDate);
      const diffMs = endDate.getTime() - now.getTime();
      remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const globalSettings = await getGlobalSettingsByGroup("SUBSCRIPTION", true);
    const globalDefault = Number(globalSettings["DEFAULT_EXTRA_USER_PRICE"] ?? 5);

    const pricePerUser = (config && config.extraUserPrice && config.extraUserPrice !== 5) 
      ? config.extraUserPrice 
      : globalDefault;

    const prorationMultiplier = Math.max(remainingDays / 30, 0);
    
    let discountPct = 0;
    if (quantity >= 100) discountPct = 0.20;
    else if (quantity >= 50) discountPct = 0.10;

    const rawBaseAmount = pricePerUser * quantity * prorationMultiplier;
    const baseAmount = rawBaseAmount * (1 - discountPct);
    const gstAmount = baseAmount * 0.18;
    const totalAmount = Math.round((baseAmount + gstAmount) * 100); // Amount in paise

    const orderOptions = {
      amount: totalAmount,
      currency: "INR",
      receipt: `ul_${schoolId.substring(0, 8)}_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(orderOptions);

    await prisma.payment.create({
      data: {
        amount: baseAmount + gstAmount,
        razorpayOrderId: order.id,
        status: PaymentStatus.PENDING,
        schoolId,
        description: `Purchase of ${quantity} additional user limits${discountPct > 0 ? ` (${discountPct * 100}% Discount Applied)` : ''}`,
      },
    });

    return res.status(201).json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      quantity,
    });
  } catch (error: any) {
    console.error("Create user limit order error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to create order" });
  }
}

export default withAuth(handler);
