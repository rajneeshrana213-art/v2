import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "../../../../../lib/middleware/cors";
import { withAuth } from "../../../../../lib/middleware/api-guard";
import { razorpayInstance } from "../../../../../lib/config/razorpay";
import { prisma } from "../../../../../lib/prisma";
import { getGlobalSettingsByGroup } from "../../../../../lib/cache/globalSettings";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { schoolId, featureKey, featureName, amount, billingPeriod, couponCode } = req.body;

    if (!schoolId || !featureKey) {
      return res
        .status(400)
        .json({ message: "Missing required fields: schoolId, featureKey" });
    }

    // Validate amount against Feature Catalog
    const globalSettings = await getGlobalSettingsByGroup("SUBSCRIPTION", true);
    const catalogJson = globalSettings["FEATURE_CATALOG"];
    let catalog: any[] = [];
    if (catalogJson) {
      try { catalog = typeof catalogJson === 'string' ? JSON.parse(catalogJson) : catalogJson; } catch (e) {}
    }

    const catalogEntry = catalog.find((f: any) => f.key?.toLowerCase() === featureKey.toLowerCase());
    
    // Determine expected base price
    let expectedPrice = 0;
    if (catalogEntry) {
      if (billingPeriod === "THREE_YEARS") {
        expectedPrice = catalogEntry.threeYearlyPrice || (catalogEntry.defaultPrice * 30);
      } else if (billingPeriod === "YEAR") {
        expectedPrice = catalogEntry.yearlyPrice || (catalogEntry.defaultPrice * 10);
      } else {
        expectedPrice = catalogEntry.defaultPrice;
      }
    }

    const numericAmount = typeof amount === "number" ? amount : parseFloat(amount);
    
    // If we have a catalog entry, we use its price. 
    // Otherwise we trust the amount but only if it's positive.
    const basePrice = (expectedPrice > 0) ? expectedPrice : numericAmount;

    if (isNaN(basePrice) || basePrice <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid amount. Amount must be a positive number." });
    }

    // Verify school exists
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          OR: [
            { scope: "GLOBAL" },
            { scope: "SPECIFIC_FEATURE", featureKey: featureKey } as any
          ],
        },
      });

      if (coupon) {
        const now = new Date();
        if (now > coupon.expiryDate || (coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage)) {
          return res.status(400).json({ message: "Coupon is expired or usage limit reached" });
        }
        discount = coupon.discountType === "FIXED_AMOUNT"
          ? coupon.discountValue
          : (numericAmount * coupon.discountValue) / 100;
      } else {
        return res.status(400).json({ message: "Invalid or inactive coupon code" });
      }
    }

    const baseAmountAfterDiscount = Math.max(basePrice - discount, 0);

    // Calculate GST (18%)
    const gstAmount = Number((baseAmountAfterDiscount * 0.18).toFixed(2));
    const totalAmount = Number((baseAmountAfterDiscount + gstAmount).toFixed(2));

    if (totalAmount <= 0) {
      const payment = await prisma.payment.create({
        data: {
          amount: 0,
          status: "COMPLETED",
          schoolId,
          razorpayOrderId: `ZERO_AMOUNT_FEAT_${schoolId}_${Date.now()}`,
          description: `Feature Activation (${billingPeriod === "THREE_YEARS" ? "3 Years" : billingPeriod === "YEAR" ? "Yearly" : "Monthly"})${couponCode ? ' [Coupon: ' + couponCode + ']' : ''}: ${featureName || featureKey
            }`,
        },
      });

      // Generate and email invoice synchronously
      const { createFeatureInvoice } = await import("@/lib/utils/invoice-utils");
      await createFeatureInvoice(payment.id).catch((err) =>
        console.error("Zero-amount feature invoice error:", err),
      );

      await prisma.schoolFeatureConfig.upsert({
        where: { schoolId_featureName: { schoolId, featureName: featureKey } },
        update: { status: "ENABLED", activatedOn: new Date() },
        create: {
          schoolId,
          featureName: featureKey,
          status: "ENABLED",
          monthlyPrice: basePrice,
          activatedOn: new Date(),
        }
      });

      // Update coupon usage
      if (couponCode) {
        await prisma.coupon.update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } }
        });
      }

      return res.status(201).json({
        zeroAmount: true,
        featureKey,
        featureName: featureName || featureKey,
        paymentId: payment.id,
      });
    }

    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Payment gateway not configured" });
    }

    const orderOptions = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR" as const,
      receipt: `feat_${featureKey.substring(0, 10)}_${Date.now()}`,
      notes: {
        schoolId,
        featureKey,
        featureName: featureName || featureKey,
        type: "feature_activation",
        billingPeriod: billingPeriod === "THREE_YEARS" ? "THREE_YEARS" : billingPeriod === "YEAR" ? "YEAR" : "MONTH",
        couponCode: couponCode || "",
      },
    };

    const order = await razorpayInstance.orders.create(orderOptions);

    // Create payment record
    await prisma.payment.create({
      data: {
        amount: totalAmount,
        razorpayOrderId: order.id,
        status: "PENDING",
        schoolId,
        description: `Feature Activation (${billingPeriod === "THREE_YEARS" ? "3 Years" : billingPeriod === "YEAR" ? "Yearly" : "Monthly"})${couponCode ? ' [Coupon: ' + couponCode + ']' : ''}: ${featureName || featureKey
          }`,
      },
    });

    return res.status(201).json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      schoolId,
      featureKey,
      featureName: featureName || featureKey,
      baseAmount: basePrice,
      discountApplied: discount,
      gstAmount,
      totalAmount,
    });
  } catch (error: any) {
    console.error("Create feature order error:", error);
    return res.status(400).json({
      message:
        error?.error?.description ||
        error?.message ||
        "Failed to create feature Razorpay order",
    });
  }
}

export default withAuth(handler);


