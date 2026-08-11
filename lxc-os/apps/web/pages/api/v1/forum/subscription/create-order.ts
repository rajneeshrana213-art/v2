import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { razorpayInstance } from "@/lib/config/razorpay";
import { PaymentStatus } from "@prisma/client";

/** Pricing table for forum user plans (in INR, before GST) */
const FORUM_PLANS: Record<string, {
  name: string;
  monthlyBase: number;
  annualBase: number;
  lifetimeBase: number;
  durationDays: { monthly: number; annual: number; lifetime: number };
}> = {
  ignite:   { name: "LXC Ignite Plus",    monthlyBase: 49,   annualBase: 499,   lifetimeBase: 1499, durationDays: { monthly: 31,  annual: 365,   lifetime: 36500 } },
  zenith:   { name: "LXC Zenith Pro",     monthlyBase: 99,   annualBase: 999,   lifetimeBase: 2999, durationDays: { monthly: 31,  annual: 365,   lifetime: 36500 } },
  apex:     { name: "LXC Apex Elite",     monthlyBase: 149,  annualBase: 1499,  lifetimeBase: 3999, durationDays: { monthly: 31,  annual: 365,   lifetime: 36500 } },
  lifetime: { name: "LXC Lifetime Elite", monthlyBase: 0,    annualBase: 0,     lifetimeBase: 3999, durationDays: { monthly: 0,   annual: 0,     lifetime: 36500 } },
};

function getForumPlanName(planKey: string, billingCycle: "monthly" | "annual" | "lifetime") {
  const suffix = billingCycle === "lifetime" ? "Lifetime" : billingCycle === "annual" ? "Annual" : "Monthly";
  return `${FORUM_PLANS[planKey].name} (${suffix})`;
}

async function getOrCreateForumDbPlan(
  planKey: string,
  billingCycle: "monthly" | "annual" | "lifetime",
  baseAmount: number,
) {
  const planMeta = FORUM_PLANS[planKey];
  const name = getForumPlanName(planKey, billingCycle);

  let dbPlan = await prisma.plan.findFirst({ where: { name, planType: "FORUM" } });
  if (!dbPlan) {
    dbPlan = await prisma.plan.create({
      data: {
        name,
        price: baseAmount,
        durationDays: planMeta.durationDays[billingCycle],
        userLimit: 1,
        planType: "FORUM",
      },
    });
  } else if (dbPlan.price !== baseAmount || dbPlan.durationDays !== planMeta.durationDays[billingCycle]) {
    dbPlan = await prisma.plan.update({
      where: { id: dbPlan.id },
      data: {
        price: baseAmount,
        durationDays: planMeta.durationDays[billingCycle],
      },
    });
  }

  return dbPlan;
}

async function getOrCreateRazorpayPlan(
  dbPlan: Awaited<ReturnType<typeof getOrCreateForumDbPlan>>,
  planName: string,
  amountWithGst: number,
  billingCycle: "monthly" | "annual",
) {
  if (dbPlan.razorpayPlanId) return dbPlan.razorpayPlanId;

  const razorpayPlan = await (razorpayInstance.plans as any).create({
    period: billingCycle === "annual" ? "yearly" : "monthly",
    interval: 1,
    item: {
      name: planName,
      amount: Math.round(amountWithGst * 100),
      currency: "INR",
      description: `${planName} auto-renewal`,
    },
  });

  await prisma.plan.update({
    where: { id: dbPlan.id },
    data: { razorpayPlanId: razorpayPlan.id },
  });

  return razorpayPlan.id as string;
}

/**
 * POST /api/v1/forum/subscription/create-order
 *
 * Creates a Razorpay order for an AI app (forum) user to purchase a premium plan.
 * Returns orderId + Razorpay key for the frontend checkout SDK.
 *
 * billingCycle: 'monthly' | 'annual' | 'lifetime'
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "forum_user") {
    return res.status(403).json({ error: "Only forum users can purchase AI plans." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { planKey, billingCycle = "monthly", autoRenew = true } = req.body;

  if (!planKey || !FORUM_PLANS[planKey]) {
    return res.status(400).json({
      error: `Invalid planKey. Must be one of: ${Object.keys(FORUM_PLANS).join(", ")}.`,
    });
  }

  if (!["monthly", "annual", "lifetime"].includes(billingCycle)) {
    return res.status(400).json({ error: "billingCycle must be 'monthly', 'annual', or 'lifetime'." });
  }

  // Lifetime plan always uses lifetime billing
  const effectiveCycle: "monthly" | "annual" | "lifetime" =
    planKey === "lifetime" ? "lifetime" : (billingCycle as "monthly" | "annual" | "lifetime");

  // Fetch user's forum profile to resolve the dynamic RIT database plan price based on their goal (educationLevel)
  const profile = await prisma.forumUserProfile.findUnique({
    where: { userId: user.id },
    select: { educationLevel: true },
  });
  const goal = (profile?.educationLevel || "school") as "school" | "college" | "competitive";
  const goalUpper = goal.toUpperCase();

  let dbName = "";
  let defaultPrice = 0;
  if (planKey === "ignite") {
    dbName = `RIT_AI_${goalUpper}_IGNITE`;
    defaultPrice = goal === "school" ? 49 : 199;
  } else if (planKey === "zenith") {
    dbName = `RIT_AI_${goalUpper}_ZENITH_PRO`;
    defaultPrice = goal === "school" ? 99 : 299;
  } else if (planKey === "apex") {
    dbName = `RIT_AI_${goalUpper}_ZENITH_ELITE`;
    defaultPrice = goal === "school" ? 199 : 499;
  } else if (planKey === "lifetime") {
    dbName = `RIT_AI_${goalUpper}_LIFETIME`;
    defaultPrice = goal === "school" ? 499 : 799;
  }

  const dbPlanRecord = await prisma.plan.findFirst({
    where: { name: dbName, planType: "RIT" },
  });
  const monthlyBase = dbPlanRecord ? dbPlanRecord.price : defaultPrice;

  const planMeta = FORUM_PLANS[planKey];
  const baseAmount =
    effectiveCycle === "lifetime"
      ? monthlyBase
      : effectiveCycle === "annual"
      ? monthlyBase * 10
      : monthlyBase;

  const gstAmount = parseFloat((baseAmount * 0.18).toFixed(2));
  const totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2));

  try {
    // Check if there is already an active subscription for this user
    const existing = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        isDeleted: false,
        endDate: { gte: new Date() },
      },
    });

    if (existing && existing.planKey === planKey) {
      return res.status(409).json({
        error: `You already have an active ${planMeta.name} subscription.`,
        expiresAt: existing.endDate,
      });
    }

    const planName = getForumPlanName(planKey, effectiveCycle);
    const dbPlan = await getOrCreateForumDbPlan(planKey, effectiveCycle, baseAmount);

    if (autoRenew && effectiveCycle !== "lifetime") {
      const razorpayPlanId = await getOrCreateRazorpayPlan(
        dbPlan,
        planName,
        totalAmount,
        effectiveCycle,
      );

      const subscription = await (razorpayInstance.subscriptions as any).create({
        plan_id: razorpayPlanId,
        total_count: effectiveCycle === "annual" ? 5 : 12,
        quantity: 1,
        customer_notify: 1,
        notes: {
          userId: user.id,
          planKey,
          billingCycle: effectiveCycle,
        },
      });

      const payment = await prisma.payment.create({
        data: {
          amount: totalAmount,
          razorpayOrderId: subscription.id as string,
          status: PaymentStatus.PENDING,
          planId: dbPlan.id,
          userId: user.id,
          description: `${planName} auto-renewal mandate`,
        },
      });

      return res.status(201).json({
        subscriptionId: subscription.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        planKey,
        planName,
        billingCycle: effectiveCycle,
        baseAmount,
        gstAmount,
        totalAmount,
        paymentId: payment.id,
        isAutoRenew: true,
      });
    }

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `forum_${user.id}_${planKey}_${Date.now()}`,
      notes: {
        userId: user.id,
        planKey,
        billingCycle: effectiveCycle,
      },
    });

    // Create pending Payment record
    const payment = await prisma.payment.create({
      data: {
        amount: totalAmount,
        razorpayOrderId: order.id as string,
        status: PaymentStatus.PENDING,
        planId: dbPlan.id,
        userId: user.id,
        description: `${planName} one-time payment`,
      },
    });

    return res.status(201).json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      planKey,
      planName,
      billingCycle: effectiveCycle,
      baseAmount,
      gstAmount,
      totalAmount,
      paymentId: payment.id,
      isAutoRenew: false,
    });
  } catch (error: any) {
    console.error("[create-order] Error:", error);
    return res.status(500).json({ error: error.message || "Failed to create order." });
  }
}
