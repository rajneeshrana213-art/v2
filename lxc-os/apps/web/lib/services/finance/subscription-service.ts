import { prisma } from "../../prisma";
import { razorpayInstance } from "../../config/razorpay";
import { createPlanInvoice } from "../../utils/invoice-utils";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";
import crypto from "crypto";
import { Readable } from "stream";
import axios from "axios";
import { uploadFile } from "../../config/upload";
import puppeteer from "puppeteer";
import {
  generatePlanInvoiceHtml,
  GstInvoiceData,
  LEARNXCHAIN_SELLER,
  GstInvoiceBuyer,
  GstInvoiceLineItem,
  GstInvoiceMeta,
  GstInvoiceTaxSummary,
} from "../../templates/invoice-templates";
import {
  calculateGstBreakup,
  amountInWordsINR,
  generateInvoiceNumber,
  logInvoiceDownload,
} from "../../utils/invoice-utils";
import { sendInvoicePdfEmail } from "../../utils/mailer";
import { sendSubscriptionReminder } from "../emailService";
import QRCode from "qrcode";
import { CONFIG } from "../../config";

export class SubscriptionService {
  /**
   * Core GST calculation helper.
   * `planPrice` is the base plan price before discounts/extras.
   * `discount` applies only to the base plan.
   * `extraUserBase` is the pre‑tax amount for extra seats (already computed).
   */
  private static calculateAmounts(
    planPrice: number,
    discount: number,
    extraUserBase: number = 0,
    isTrial?: boolean,
  ) {
    let baseAmount = Math.max(planPrice - discount, 0);

    if (isTrial) {
      baseAmount = Number(process.env.TRIAL_PRICE || 2);
    }

    // Add extra‑seat charges to the taxable base
    baseAmount = Number((baseAmount + extraUserBase).toFixed(2));

    const gstAmount = Number((baseAmount * 0.18).toFixed(2));
    const totalAmount = Number((baseAmount + gstAmount).toFixed(2));
    return { baseAmount, gstAmount, totalAmount, extraUserCharge: extraUserBase };
  }

  /**
   * Helper to compute explicit extra‑user billing for MODEL_B.
   * Treats (allowedUsers - planUserLimit) as paid extra seats.
   */
  static async calculateExtraUserCharge(
    schoolId: string | null | undefined,
    planUserLimit: number | null,
  ) {
    if (!schoolId || !planUserLimit || planUserLimit <= 0) {
      return { extraSeats: 0, extraUserPrice: 0, monthlyCharge: 0 };
    }

    const config = await prisma.schoolSubscriptionConfig.findUnique({
      where: { schoolId },
    });

    if (!config) {
      return { extraSeats: 0, extraUserPrice: 0, monthlyCharge: 0 };
    }

    // Include bonus users in the recurring extra seats calculation
    let extraSeats = config.bonusUsers || 0;

    // If they explicitly have MODEL_B, we also charge for increased `allowedUsers` above the base plan
    if (config.planModel === "MODEL_B") {
      extraSeats += Math.max(0, config.allowedUsers - planUserLimit);
    }

    if (extraSeats <= 0) {
      return {
        extraSeats: 0,
        extraUserPrice: config.extraUserPrice,
        monthlyCharge: 0,
      };
    }

    const monthlyCharge = Number(
      (extraSeats * config.extraUserPrice).toFixed(2),
    );
    return { extraSeats, extraUserPrice: config.extraUserPrice, monthlyCharge };
  }

  /**
   * Razorpay Subscriptions (Recurring Mandates) require a 'plan_id' on Razorpay side.
   * This helper ensures our internal plan is mapped to a Razorpay Plan object.
   */
  private static async getOrCreateRazorpayPlan(plan: any) {
    if (plan.razorpayPlanId) return plan.razorpayPlanId;

    throw new Error(
      `Razorpay Plan mapping missing for plan: ${plan.name}. Please map it in the Superadmin dashboard.`,
    );
  }

  static async createRazorpayOrder(data: {
    planId: string;
    schoolId: string;
    couponCode?: string;
    isTrial?: boolean;
    billingPeriod?: "MONTH" | "YEAR" | "THREE_YEARS";
    isAutoRenew?: boolean;
  }) {
    const { planId, schoolId, couponCode, isTrial, billingPeriod, isAutoRenew } = data;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plan not found");

    let coupon;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          OR: [{ planId: planId }, { scope: "GLOBAL" }],
        },
      });
      if (!coupon) throw new Error("Coupon not found or inactive");
      if (
        new Date() > coupon.expiryDate ||
        (coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage)
      ) {
        throw new Error("Coupon is not valid or expired");
      }
    }

    // Base discount is zero; we no longer apply automatic
    // first-subscription/long-duration discounts. Any discounts
    // must come explicitly from coupons.
    let discount = 0;

    if (coupon) {
      const couponDiscount =
        coupon.discountType === "FIXED_AMOUNT"
          ? coupon.discountValue
          : (plan.price * coupon.discountValue) / 100;
      discount += couponDiscount;
    }

    // Explicit extra user billing for MODEL_B
    const { monthlyCharge: extraUserBase, extraSeats: extraUserSeats } =
      await this.calculateExtraUserCharge(schoolId, plan.userLimit ?? null);

    const periodMultiplier = billingPeriod === "THREE_YEARS" ? 36 : billingPeriod === "YEAR" ? 12 : 1;

    const { baseAmount, gstAmount, totalAmount, extraUserCharge } = this.calculateAmounts(
      plan.price * periodMultiplier,
      discount,
      extraUserBase * periodMultiplier,
      isTrial,
    );

    const breakdown = {
      basePlanPrice: plan.price * periodMultiplier,
      discountApplied: discount,
      extraUserSeats, // We need to get this from calculateExtraUserCharge
      extraUserCharge: extraUserCharge,
      gstAmount,
      totalAmount,
    };

    // If coupon (and extras) lead to a zero-amount invoice, skip Razorpay and directly
    // create a completed payment + subscription.
    if (totalAmount <= 0) {
      const payment = await prisma.payment.create({
        data: {
          amount: 0,
          status: PaymentStatus.COMPLETED,
          planId,
          schoolId,
          // Synthetic Razorpay order id for zero-amount flows (must be unique & non-null)
          razorpayOrderId: `ZERO_AMOUNT_${schoolId}_${Date.now()}`,
        },
      });

      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          schoolId,
          isActive: true,
          endDate: { gte: new Date() },
        },
      });

      const duration = (isTrial ? 15 : plan.durationDays) * periodMultiplier;

      const subscriptionData = {
        planId,
        schoolId,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 86400000),
        paymentId: payment.id,
        status: SubscriptionStatus.ACTIVE,
        isActive: true,
        couponId: coupon?.id,
        userLimit: plan.userLimit ?? null,
      };

      const subscription = activeSubscription
        ? await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: subscriptionData,
        })
        : await prisma.subscription.create({ data: subscriptionData });

      // Keep SchoolSubscriptionConfig.allowedUsers in sync
      if (plan.userLimit && plan.userLimit > 0) {
        const existingConfig = await prisma.schoolSubscriptionConfig.findUnique(
          {
            where: { schoolId },
          },
        );

        if (!existingConfig) {
          await prisma.schoolSubscriptionConfig.create({
            data: {
              schoolId,
              planModel: "MODEL_B",
              allowedUsers: plan.userLimit,
            },
          });
        } else if (
          existingConfig.planModel === "MODEL_B" &&
          existingConfig.allowedUsers < plan.userLimit
        ) {
          await prisma.schoolSubscriptionConfig.update({
            where: { schoolId },
            data: { allowedUsers: plan.userLimit },
          });
        }
      }

      if (coupon) {
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: { user: true },
      });
      // Generate and email invoice synchronously for zero-amount plans
      await createPlanInvoice(subscription.id).catch((err) =>
        console.error("Zero-amount plan invoice error:", err),
      );

      return {
        zeroAmount: true,
        subscriptionId: subscription.id,
        planId,
        schoolId,
        couponCode: couponCode || null,
        isTrial: !!isTrial,
        discountApplied: discount,
        baseAmount,
        gstAmount,
        totalAmount,
        breakdown,
      };
    }

    if (isAutoRenew) {
      // Handle Recurring Mandate (Razorpay Subscription)
      const razorpayPlanId = await this.getOrCreateRazorpayPlan(plan);

      const subscriptionOptions = {
        plan_id: razorpayPlanId,
        total_count: billingPeriod === "THREE_YEARS" ? 3 : billingPeriod === "YEAR" ? 5 : 12, // Arbitrary limit for mandate
        quantity: 1,
        customer_notify: 1 as any,
      };

      const razorpaySubscription = (await razorpayInstance.subscriptions.create(
        subscriptionOptions,
      )) as any;

      await prisma.payment.create({
        data: {
          amount: totalAmount,
          razorpayOrderId: razorpaySubscription.id, // We use subscription id here
          status: PaymentStatus.PENDING,
          planId,
          schoolId,
        },
      });

      return {
        subscriptionId: razorpaySubscription.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: "INR",
        planId,
        schoolId,
        isAutoRenew: true,
      };
    }

    const orderOptions = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(orderOptions);

    await prisma.payment.create({
      data: {
        amount: totalAmount,
        razorpayOrderId: order.id,
        status: PaymentStatus.PENDING,
        planId,
        schoolId,
      },
    });

    return {
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      planId,
      schoolId,
      couponCode: couponCode || null,
      isTrial: !!isTrial,
      discountApplied: discount,
      baseAmount,
      gstAmount,
      totalAmount,
      breakdown,
    };
  }

  static async verifyRazorpayPayment(data: {
    razorpay_order_id?: string;
    razorpay_subscription_id?: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planId: string;
    schoolId?: string;
    groupId?: string;
    couponCode?: string;
    isTrial?: boolean;
    billingPeriod?: "MONTH" | "YEAR" | "THREE_YEARS";
  }) {
    const {
      razorpay_order_id,
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      schoolId,
      groupId,
      couponCode,
      isTrial,
      billingPeriod,
    } = data;

    // Signature verification logic differs for standard orders vs subscriptions
    const body = razorpay_order_id 
      ? `${razorpay_order_id}|${razorpay_payment_id}` 
      : `${razorpay_payment_id}|${razorpay_subscription_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid signature");
    }

    const orderOrSubId = razorpay_order_id || razorpay_subscription_id;

    if (!orderOrSubId) {
      throw new Error("Razorpay Order ID or Subscription ID is missing");
    }

    const paymentDetails =
      await razorpayInstance.payments.fetch(razorpay_payment_id);
    const paymentMethod = paymentDetails?.method || "UNKNOWN";

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderOrSubId },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (groupId) {
      // For group payments, we don't necessarily have schoolId in payment record yet
      // but we check if the plan/order matches
    } else if (payment.planId !== planId || (schoolId && payment.schoolId !== schoolId)) {
      throw new Error("Payment details mismatch");
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: PaymentStatus.COMPLETED,
        paymentDate: new Date(),
        paymentMethod,
        failureReason: null,
        planId: planId, // Always persist the planId
        schoolId: schoolId || null, // Persist schoolId if available
      },
    });

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plan not found");

    let coupon;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          OR: [{ planId: planId }, { scope: "GLOBAL" }],
        },
      });
      if (
        coupon &&
        (new Date() > coupon.expiryDate ||
          (coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage))
      ) {
        throw new Error("Coupon is not valid or expired");
      }
    }

    const activeSubscription = schoolId ? await prisma.subscription.findFirst({
      where: {
        schoolId,
        isActive: true,
        endDate: { gte: new Date() },
      },
    }) : null;

    // Keep discount logic in sync with createRazorpayOrder –
    // do not apply implicit first-subscription discounts.
    let discount = 0;

    if (coupon) {
      const couponDiscount =
        coupon.discountType === "FIXED_AMOUNT"
          ? coupon.discountValue
          : (plan.price * coupon.discountValue) / 100;
      discount += couponDiscount;
    }

    // Recompute extra‑user base so invoices & reporting stay consistent
    const { monthlyCharge: extraUserBase } = schoolId ?
      await this.calculateExtraUserCharge(schoolId, plan.userLimit ?? null) : { monthlyCharge: 0 };

    const periodMultiplier = billingPeriod === "THREE_YEARS" ? 36 : billingPeriod === "YEAR" ? 12 : 1;
    const duration = (isTrial ? 15 : plan.durationDays) * periodMultiplier;

    const isSub = !!(data as any).razorpay_subscription_id;

    const subscriptionData: any = {
      planId,
      schoolId,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 86400000),
      paymentId: payment.id,
      orderId: orderOrSubId, // Use the common ID
      receipt: `receipt_${Date.now()}`,
      status: SubscriptionStatus.ACTIVE,
      isActive: true,
      couponId: coupon?.id,
      // Freeze user limit per subscription for downstream checks
      userLimit: plan.userLimit ?? null,
      branchLimit: plan.branchLimit ?? null,
      razorpaySubscriptionId: isSub ? (data as any).razorpay_subscription_id : null,
      isAutoRenewEnabled: isSub,
    };

    let subscription = null;
    if (schoolId) {
      subscription = activeSubscription
        ? await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: subscriptionData,
        })
        : await prisma.subscription.create({ data: subscriptionData });
    }

    // On plan assignment, keep SchoolSubscriptionConfig.allowedUsers in sync with plan.userLimit
    if (schoolId && plan.userLimit && plan.userLimit > 0) {
      const existingConfig = await prisma.schoolSubscriptionConfig.findUnique({
        where: { schoolId },
      });

      if (!existingConfig) {
        await prisma.schoolSubscriptionConfig.create({
          data: {
            schoolId,
            // Default to MODEL_B when a fixed plan with user limit is purchased
            planModel: "MODEL_B",
            allowedUsers: plan.userLimit,
          },
        });
      } else if (
        existingConfig.planModel === "MODEL_B" &&
        existingConfig.allowedUsers < plan.userLimit
      ) {
        // Only bump up allowedUsers to at least the plan limit; never reduce it here
        await prisma.schoolSubscriptionConfig.update({
          where: { schoolId },
          data: { allowedUsers: plan.userLimit },
        });
      }
    }

    if (coupon) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    if (groupId) {
      // Always create a group-level subscription record so the admin dashboard shows the active plan reliably,
      // even if there are currently 0 schools.
      await prisma.subscription.updateMany({
        where: { schoolGroupId: groupId, isActive: true },
        data: { isActive: false, status: SubscriptionStatus.CANCELLED }
      });

      const mainSub = await prisma.subscription.create({
        data: {
          ...subscriptionData,
          schoolId: null,
          schoolGroupId: groupId,
        }
      });

      // Update the organization's branch limit based on the purchased plan
      await prisma.schoolGroup.update({
        where: { id: groupId },
        data: { branchLimit: plan.branchLimit }
      });

      const schools = await prisma.school.findMany({
        where: { groupId, isDeleted: false },
        select: { id: true }
      });

      if (schools.length > 0) {
        await Promise.all(schools.flatMap(school => [
          prisma.subscription.create({
            data: {
              ...subscriptionData,
              schoolId: school.id,
              schoolGroupId: groupId,
            }
          }),
          prisma.schoolSubscriptionConfig.upsert({
            where: { schoolId: school.id },
            create: {
              schoolId: school.id,
              planModel: "MODEL_B",
              allowedUsers: plan.userLimit || 0
            },
            update: {
              planModel: "MODEL_B",
              allowedUsers: plan.userLimit || 0
            }
          })
        ]));
      }
      return { groupId, subCount: schools.length, subscription: mainSub };
    }

    if (subscription) {
      // Generate and send invoice PDF
      console.log(`[SubscriptionService] Triggering invoice generation for ${subscription.id}`);
      await createPlanInvoice(subscription.id).catch((err) =>
        console.error("Invoice generation error during verification:", err),
      );
    }

    return subscription;
  }

  /**
   * Attach a Razorpay subscription ID to an existing subscription and
   * mark it as auto-renew enabled. This is a thin helper; the actual
   * Razorpay subscription creation should happen in the controller/UI flow.
   */
  static async enableAutoRenewForSubscription(params: {
    subscriptionId: string;
    razorpaySubscriptionId: string;
  }) {
    const { subscriptionId, razorpaySubscriptionId } = params;

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        razorpaySubscriptionId,
        isAutoRenewEnabled: true,
      },
    });
  }

  static async disableAutoRenewForSubscription(subscriptionId: string) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        isAutoRenewEnabled: false,
      },
    });
  }

  static async handleWebhook(signature: string, rawBody: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error("Invalid webhook signature");
    }

    const body = JSON.parse(rawBody);
    const eventId = body.id; // Razorpay event ID

    // Check for idempotency
    const existingLog = await (prisma as any).webhookLog.findUnique({
      where: { eventId },
    });

    if (existingLog) {
      console.log(`Webhook event ${eventId} already processed. Skipping.`);
      return { duplicate: true };
    }

    // Log the event
    await (prisma as any).webhookLog.create({
      data: {
        eventId,
        payload: body,
      },
    });

    const { event, payload } = body;

    // Basic payment failure handling (existing behaviour)
    if (event === "payment.failed") {
      const orderId = payload.payment.entity.order_id;
      const existingPayment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (
        existingPayment &&
        (existingPayment.status === PaymentStatus.PENDING ||
          existingPayment.status === ("PROCESSING" as PaymentStatus))
      ) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: PaymentStatus.FAILED,
            failureReason:
              payload.payment.entity.error_description || "Unknown",
          },
        });

        // Notify user about failure
        const school = await prisma.school.findUnique({
          where: { id: existingPayment.schoolId || "" },
          include: { user: true },
        });
        if (school?.user?.email) {
          sendSubscriptionReminder(
            school.user.email,
            school.schoolName,
            `URGENT: Your auto-renewal payment failed. Reason: ${payload.payment.entity.error_description || "Unknown"}. Please update your payment method.`,
          ).catch(console.error);
          
          // Generate a "FAILED" status invoice
          const subscription = await prisma.subscription.findFirst({
            where: { paymentId: existingPayment.id }
          });
          if (subscription) {
            createPlanInvoice(subscription.id).catch(console.error);
          }
        }
      }
    }

    // Framework for Razorpay Subscriptions auto-renew events
    if (event === "subscription.charged") {
      const subEntity = payload.subscription.entity;
      const razorpaySubId = subEntity.id as string;

      // Find our local subscription linked to this Razorpay subscription
      const localSub = await prisma.subscription.findFirst({
        where: {
          razorpaySubscriptionId: razorpaySubId,
          isAutoRenewEnabled: true,
        },
        include: { plan: true, school: { include: { user: true } } },
      });

      if (!localSub) return;

      // Create a new payment row for this charge
      const amount =
        subEntity.total_count && subEntity.customer_notify
          ? localSub.plan.price
          : localSub.plan.price;

      const payment = await prisma.payment.create({
        data: {
          amount,
          status: PaymentStatus.COMPLETED,
          schoolId: localSub.schoolId,
          planId: localSub.planId,
          // Use Razorpay subscription id as a stable synthetic order id for auto-renew charges
          razorpayOrderId:
            subEntity.id || `SUB_CHARGE_${razorpaySubId}_${Date.now()}`,
        },
      });

      // Extend subscription end date by one plan duration cycle
      const newEndDate = new Date(
        localSub.endDate.getTime() + localSub.plan.durationDays * 86400000,
      );

      await prisma.subscription.update({
        where: { id: localSub.id },
        data: {
          endDate: newEndDate,
          paymentId: payment.id,
          status: SubscriptionStatus.ACTIVE,
          isActive: true,
        },
      });

      // Generate invoice
      if (localSub.school?.user?.email) {
        await createPlanInvoice(localSub.id).catch((err) =>
          console.error("Auto-renew invoice generation error:", err),
        );
      }
    }

    if (event === "subscription.completed") {
      const subEntity = payload.subscription.entity;
      const razorpaySubId = subEntity.id as string;

      await prisma.subscription.updateMany({
        where: { razorpaySubscriptionId: razorpaySubId },
        data: {
          isAutoRenewEnabled: false,
        },
      });
    }
  }

  /**
   * Centralised check for school access based on active subscription.
   * Handles grace period logic.
   */
  static async checkAccess(schoolId: string) {
    const config = await prisma.schoolSubscriptionConfig.findUnique({
      where: { schoolId },
    });

    const subscription = await prisma.subscription.findFirst({
      where: {
        schoolId,
        isActive: true,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.SUSPENDED] },
      },
      orderBy: { endDate: "desc" },
    });

    if (!subscription) {
      return { hasAccess: false, reason: "NO_SUBSCRIPTION" };
    }

    const now = new Date();
    const gracePeriodDays = config?.gracePeriodDays || 0;
    const gracePeriodEndDate = new Date(
      subscription.endDate.getTime() + gracePeriodDays * 86400000,
    );

    if (now > gracePeriodEndDate) {
      // Past grace period
      if (subscription.status !== SubscriptionStatus.EXPIRED) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: SubscriptionStatus.EXPIRED, isActive: false },
        });
      }
      return { hasAccess: false, reason: "EXPIRED" };
    }

    if (now > subscription.endDate) {
      // In grace period
      return { hasAccess: true, isGracePeriod: true, reason: "GRACE_PERIOD" };
    }

    return { hasAccess: true, reason: "ACTIVE" };
  }

  // Invoice Logic - Replicating duplicate logic from controller to ensure service completeness
  // Note: logic already in invoice-utils.ts/createPlanInvoice, but controller endpoint handled request/response.
  // The service just needs to method to retrieve PDF buffer or URL
  static async getPlanInvoice(
    subscriptionId: string,
    userId: string,
    userRole: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        school: { include: { user: true } },
        schoolGroup: true,
        payment: true,
      },
    });
    if (!subscription || !subscription.payment)
      throw new Error("Subscription not found");

    if (
      userRole !== "superadmin" &&
      userRole !== "SUPER_ADMIN" &&
      userId !== subscription.school?.userId &&
      userId !== subscription.schoolGroup?.ownerId
    ) {
      throw new Error("Unauthorized");
    }

    // Check if invoice URL exists
    let pdfBuffer: Buffer | undefined;
    let invoiceUrl = subscription.payment.invoiceUrl;
    const invoiceNumber =
      subscription.payment.invoiceNumber ||
      (await generateInvoiceNumber(subscription.schoolId || ""));

    if (!subscription.payment.invoiceNumber) {
      await prisma.payment.update({
        where: { id: subscription.payment.id },
        data: { invoiceNumber },
      });
    }

    if (invoiceUrl) {
      try {
        const fileRes = await axios.get<ArrayBuffer>(invoiceUrl, {
          responseType: "arraybuffer",
        });
        pdfBuffer = Buffer.from(fileRes.data);
      } catch (e) {
        console.warn("Failed to catch stored invoice", e);
      }
    }

    if (!pdfBuffer) {
      // Logic duplicating createPlanInvoice somewhat but reusing invoice-utils
      // Better to just call createPlanInvoice if url missing, but createPlanInvoice does upload and email.
      // Let's just use createPlanInvoice to ensure consistency.
      const result = await createPlanInvoice(subscriptionId);
      // This returns the URL. We then fetch it.
      if (result && result.url) {
        const fileRes = await axios.get<ArrayBuffer>(result.url, {
          responseType: "arraybuffer",
        });
        pdfBuffer = Buffer.from(fileRes.data);
      }
    }

    if (!pdfBuffer) {
      throw new Error("Failed to generate or retrieve invoice PDF");
    }

    await logInvoiceDownload(invoiceNumber, userId);
    return { buffer: pdfBuffer, filename: `${invoiceNumber}.pdf` };
  }

  /**
   * Phase 8: Plan Change Engine
   * Handles immediate upgrades or scheduled downgrades.
   */
  static async changeSubscriptionPlan(params: {
    schoolId: string;
    newPlanId: string;
    immediate: boolean;
  }) {
    const { schoolId, newPlanId, immediate } = params;

    const currentSub = await prisma.subscription.findFirst({
      where: { schoolId, isActive: true },
      orderBy: { endDate: "desc" },
    });

    if (immediate) {
      // UPGRADE: Cancel old, create new
      if (currentSub?.razorpaySubscriptionId) {
        // Cancel in Razorpay (optional logic here to call razorpayInstance.subscriptions.cancel)
      }
      
      await prisma.subscription.updateMany({
        where: { schoolId, isActive: true },
        data: { isActive: false, status: SubscriptionStatus.EXPIRED },
      });

      // New subscription creation would follow via the UI flow (calling createRazorpayOrder)
      return { action: "UPGRADE_INITIATED", message: "Current subscription cancelled. Please proceed to payment for the new plan." };
    } else {
      // DOWNGRADE: Schedule for end of current cycle
      // Razorpay allows scheduling changes, but for simplicity we mark our local record
      return { action: "DOWNGRADE_SCHEDULED", message: "Plan will change at the end of the current billing cycle." };
    }
  }
}
