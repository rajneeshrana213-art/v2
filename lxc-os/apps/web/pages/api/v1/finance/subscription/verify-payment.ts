import { NextApiRequest, NextApiResponse } from "next";
import { SubscriptionService } from "../../../../../lib/services/finance/subscription-service";
import { cors } from "../../../../../lib/middleware/cors";
import { razorpayInstance } from "../../../../../lib/config/razorpay";
import { prisma } from "../../../../../lib/prisma";
import { PaymentStatus, SubscriptionFeatureStatus } from "@prisma/client";
import crypto from "crypto";
import { withAuth } from "../../../../../lib/middleware/api-guard";
import { createFeatureInvoice } from "../../../../../lib/utils/invoice-utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // User limit purchase payment verification
    if (req.body.extraUserQuantity) {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        schoolId,
        extraUserQuantity,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !schoolId ||
        !extraUserQuantity
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify signature
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid signature" });
      }

      // Fetch payment details from Razorpay
      const paymentDetails =
        await razorpayInstance.payments.fetch(razorpay_payment_id);
      const paymentMethod = paymentDetails?.method || "UNKNOWN";

      // Update payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      if (payment.schoolId !== schoolId) {
        return res.status(400).json({ message: "Payment details mismatch" });
      }

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

      // Update SchoolSubscriptionConfig to increment bonusUsers
      await prisma.schoolSubscriptionConfig.update({
        where: { schoolId },
        data: {
          bonusUsers: {
            increment: Number(extraUserQuantity),
          },
        },
      });

      // Generate and email invoice synchronously for user limit purchase
      await createFeatureInvoice(payment.id).catch((err) =>
        console.error("User limit invoice error:", err),
      );

      return res.status(200).json({
        message: "Payment verified and user limit increased",
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: PaymentStatus.COMPLETED,
        },
        increasedQuantity: extraUserQuantity,
      });
    }

    // Feature activation payment verification
    if (req.body.featureKey) {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        schoolId,
        featureKey,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !schoolId ||
        !featureKey
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify signature
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid signature" });
      }

      // Fetch payment details from Razorpay
      const paymentDetails =
        await razorpayInstance.payments.fetch(razorpay_payment_id);
      const paymentMethod = paymentDetails?.method || "UNKNOWN";

      // Update payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      if (payment.schoolId !== schoolId) {
        return res.status(400).json({ message: "Payment details mismatch" });
      }

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

      // Update coupon usage if applicable
      if (req.body.couponCode) {
        await prisma.coupon.update({
          where: { code: req.body.couponCode },
          data: { usedCount: { increment: 1 } },
        }).catch(err => console.error("Failed to update coupon usage:", err));
      }

      // Ensure feature is enabled after successful payment
      await prisma.schoolFeatureConfig.upsert({
        where: {
          schoolId_featureName: {
            schoolId,
            featureName: featureKey,
          },
        },
        update: {
          status: SubscriptionFeatureStatus.ENABLED,
          activatedOn: new Date(),
        },
        create: {
          schoolId,
          featureName: featureKey,
          status: SubscriptionFeatureStatus.ENABLED,
          monthlyPrice: payment.amount / 1.18, // Remove GST to get base amount
          activatedOn: new Date(),
          isMandatory: false,
        },
      });

      // Generate and email invoice synchronously
      await createFeatureInvoice(payment.id).catch((err) =>
        console.error("Feature invoice error:", err),
      );

      return res.status(200).json({
        message: "Payment verified and feature activated",
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: PaymentStatus.COMPLETED,
        },
        feature: {
          key: featureKey,
          status: SubscriptionFeatureStatus.ENABLED,
        },
      });
    }

    // Plan subscription payments
    const result = await SubscriptionService.verifyRazorpayPayment(req.body);
    return res.status(200).json({
      message: "Payment verified and subscription processed",
      subscription: result,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Error verifying payment" });
  }
}

export default withAuth(handler);
