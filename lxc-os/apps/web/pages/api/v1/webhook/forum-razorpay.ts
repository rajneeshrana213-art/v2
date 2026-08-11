import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";
import getRawBody from "raw-body";
import crypto from "crypto";

export const config = {
  api: { bodyParser: false },
};

const PLAN_DURATIONS: Record<string, Record<string, number>> = {
  ignite: { monthly: 31, annual: 365 },
  zenith: { monthly: 31, annual: 365 },
  apex: { monthly: 31, annual: 365 },
};

/**
 * POST /api/v1/webhook/forum-razorpay
 *
 * Razorpay webhook handler for forum user (AI app) subscriptions.
 * Handles: payment.captured, payment.failed, subscription.charged, subscription.completed
 *
 * Register this endpoint in Razorpay Dashboard → Settings → Webhooks.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const rawBody = await getRawBody(req, { encoding: "utf-8" });

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSig = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    if (expectedSig !== signature) {
      console.error("[forum-webhook] Invalid signature");
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const body = JSON.parse(rawBody);
    const eventId = body.id;

    // Idempotency check
    const existing = await (prisma as any).webhookLog.findUnique({ where: { eventId } });
    if (existing) {
      console.log(`[forum-webhook] Event ${eventId} already processed. Skipping.`);
      return res.status(200).json({ received: true, duplicate: true });
    }

    await (prisma as any).webhookLog.create({
      data: { eventId, payload: body, provider: "razorpay_forum" },
    });

    const { event, payload } = body;

    // ── payment.captured ──────────────────────────────────────────────────
    if (event === "payment.captured") {
      const orderId = payload.payment?.entity?.order_id;
      if (!orderId) return res.status(200).json({ received: true });

      const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
      if (!payment || !payment.userId) return res.status(200).json({ received: true });

      // Only handle forum user payments
      const sub = await prisma.subscription.findFirst({
        where: { paymentId: payment.id, userId: payment.userId },
      });

      if (sub && sub.status === SubscriptionStatus.PENDING) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: payload.payment.entity.id,
            status: PaymentStatus.COMPLETED,
            paymentDate: new Date(),
            paymentMethod: payload.payment.entity.method || "UNKNOWN",
          },
        });

        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: SubscriptionStatus.ACTIVE, isActive: true },
        });
      }
    }

    // ── payment.failed ────────────────────────────────────────────────────
    if (event === "payment.failed") {
      const orderId = payload.payment?.entity?.order_id;
      if (!orderId) return res.status(200).json({ received: true });

      const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
      if (!payment || !payment.userId) return res.status(200).json({ received: true });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: payload.payment?.entity?.error_description || "Payment failed",
        },
      });

      // Mark the subscription as cancelled
      await prisma.subscription.updateMany({
        where: { paymentId: payment.id, userId: payment.userId },
        data: { status: SubscriptionStatus.CANCELLED, isActive: false },
      });
    }

    // ── subscription.charged (auto-renew cycle) ───────────────────────────
    if (event === "subscription.charged") {
      const subEntity = payload.subscription?.entity;
      const razorpaySubId = subEntity?.id as string;
      if (!razorpaySubId) return res.status(200).json({ received: true });

      const localSub = await prisma.subscription.findFirst({
        where: {
          razorpaySubscriptionId: razorpaySubId,
          isAutoRenewEnabled: true,
          userId: { not: null },
        },
        include: { plan: true },
      });

      if (!localSub) return res.status(200).json({ received: true });

      const durationDays =
        PLAN_DURATIONS[localSub.planKey || "ignite"]?.[localSub.billingCycle || "monthly"] ?? 31;
      const newEndDate = new Date(localSub.endDate.getTime() + durationDays * 86_400_000);

      // Create a new payment record for this auto-renew charge
      const newPayment = await prisma.payment.create({
        data: {
          amount: localSub.plan.price,
          razorpayOrderId: `SUB_AUTO_${razorpaySubId}_${Date.now()}`,
          status: PaymentStatus.COMPLETED,
          userId: localSub.userId,
          planId: localSub.planId,
          paymentDate: new Date(),
          description: `Auto-renewal: ${localSub.plan.name}`,
        },
      });

      await prisma.subscription.update({
        where: { id: localSub.id },
        data: {
          endDate: newEndDate,
          paymentId: newPayment.id,
          status: SubscriptionStatus.ACTIVE,
          isActive: true,
        },
      });
    }

    // ── subscription.completed (mandate ended) ────────────────────────────
    if (event === "subscription.completed") {
      const razorpaySubId = payload.subscription?.entity?.id as string;
      if (!razorpaySubId) return res.status(200).json({ received: true });

      await prisma.subscription.updateMany({
        where: { razorpaySubscriptionId: razorpaySubId },
        data: { isAutoRenewEnabled: false },
      });
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("[forum-webhook] Error:", error);
    return res.status(400).json({ error: error.message || "Webhook processing failed" });
  }
}
