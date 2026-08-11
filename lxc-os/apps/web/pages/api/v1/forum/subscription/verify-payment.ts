import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { razorpayInstance } from "@/lib/config/razorpay";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";
import crypto from "crypto";

const PLAN_DURATIONS: Record<string, Record<string, number>> = {
  ignite:   { monthly: 31, annual: 365, lifetime: 36500 },
  zenith:   { monthly: 31, annual: 365, lifetime: 36500 },
  apex:     { monthly: 31, annual: 365, lifetime: 36500 },
  lifetime: { monthly: 36500, annual: 36500, lifetime: 36500 },
};

const PLAN_NAMES: Record<string, string> = {
  ignite:   "LXC Ignite Plus",
  zenith:   "LXC Zenith Pro",
  apex:     "LXC Apex Elite",
  lifetime: "LXC Lifetime Elite",
};

function getForumPlanName(planKey: string, billingCycle: string) {
  const effectiveCycle = planKey === "lifetime" ? "lifetime" : billingCycle;
  const suffix = effectiveCycle === "lifetime" ? "Lifetime" : effectiveCycle === "annual" ? "Annual" : "Monthly";
  return `${PLAN_NAMES[planKey]} (${suffix})`;
}

/**
 * POST /api/v1/forum/subscription/verify-payment
 *
 * Verifies Razorpay payment signature and activates the user's forum plan.
 * For lifetime plans, endDate is set ~100 years in the future (effectively never-expiring).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "forum_user") {
    return res.status(403).json({ error: "Only forum users can verify AI plan payments." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const {
    razorpay_order_id,
    razorpay_subscription_id,
    razorpay_payment_id,
    razorpay_signature,
    planKey,
    billingCycle = "monthly",
  } = req.body;

  if ((!razorpay_order_id && !razorpay_subscription_id) || !razorpay_payment_id || !razorpay_signature || !planKey) {
    return res.status(400).json({ error: "Missing required payment fields." });
  }

  if (!PLAN_NAMES[planKey]) {
    return res.status(400).json({ error: "Invalid planKey." });
  }

  // --- HMAC-SHA256 Signature Verification ---
  const isAutoRenew = Boolean(razorpay_subscription_id);
  const body = isAutoRenew
    ? `${razorpay_payment_id}|${razorpay_subscription_id}`
    : `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ error: "Invalid payment signature. Payment not verified." });
  }

  try {
    // Fetch payment method from Razorpay
    const rzpPayment = await razorpayInstance.payments.fetch(razorpay_payment_id);
    const paymentMethod = (rzpPayment as any)?.method || "UNKNOWN";

    // Find the pending Payment record
    const paymentReferenceId = razorpay_order_id || razorpay_subscription_id;
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: paymentReferenceId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found." });
    }

    if (payment.userId !== user.id) {
      return res.status(403).json({ error: "Payment does not belong to this user." });
    }

    // Mark payment completed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: PaymentStatus.COMPLETED,
        paymentDate: new Date(),
        paymentMethod,
        failureReason: null,
      },
    });

    const effectiveCycle = planKey === "lifetime" ? "lifetime" : billingCycle;

    // Find plan record
    const dbPlan = await prisma.plan.findFirst({
      where: { name: getForumPlanName(planKey, effectiveCycle), planType: "FORUM" },
    });
    if (!dbPlan) {
      return res.status(404).json({ error: "Plan record not found in database." });
    }

    // Determine duration — lifetime = 100 years (36500 days) ≈ never expires
    const durationDays = PLAN_DURATIONS[planKey]?.[effectiveCycle] ?? 31;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 86_400_000);

    // Deactivate any existing active forum subscription for this user
    await prisma.subscription.updateMany({
      where: { userId: user.id, isActive: true, isDeleted: false },
      data: { isActive: false, status: SubscriptionStatus.CANCELLED },
    });

    // Resolve the final planKey stored (lifetime plan is stored as 'lifetime',
    // but grants apex-level access via planIncludes on the frontend)
    const storedPlanKey = planKey === "lifetime" ? "lifetime" : planKey;

    // Create the new active subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planKey: storedPlanKey,
        planId: dbPlan.id,
        paymentId: payment.id,
        orderId: paymentReferenceId,
        receipt: `forum_${user.id}_${planKey}_${Date.now()}`,
        startDate,
        endDate,
        status: SubscriptionStatus.ACTIVE,
        isActive: true,
        billingCycle: effectiveCycle,
        razorpaySubscriptionId: razorpay_subscription_id || null,
        isAutoRenewEnabled: isAutoRenew,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${PLAN_NAMES[planKey]} activated successfully!`,
      subscription: {
        id: subscription.id,
        planKey: subscription.planKey,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        billingCycle: subscription.billingCycle,
        isAutoRenew: subscription.isAutoRenewEnabled,
        isLifetime: planKey === "lifetime",
      },
    });
  } catch (error: any) {
    console.error("[verify-payment] Error:", error);
    return res.status(500).json({ error: error.message || "Payment verification failed." });
  }
}
