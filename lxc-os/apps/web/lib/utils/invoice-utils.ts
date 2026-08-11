import { prisma } from "../prisma";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { uploadFile } from "../config/upload";

import {
  generatePlanInvoiceHtml,
  LEARNXCHAIN_SELLER,
  GstInvoiceBuyer,
  GstInvoiceData,
  GstInvoiceLineItem,
  GstInvoiceMeta,
  GstInvoiceTaxSummary,
} from "../templates/invoice-templates";
import { sendInvoicePdfEmail } from "./mailer";
import { CONFIG } from "../config";

const LEARNXCHAIN_LOGO_URL =
  CONFIG.EMAIL_IMAGE_BASE_URL ||
  "https://res.cloudinary.com/du9le4f66/image/upload/v1773151448/logo_q0razc.png";

export const generateInvoiceNumber = async (
  schoolId: string | null,
  isGlobalSaaS = false,
): Promise<string> => {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}`;

  if (isGlobalSaaS || !schoolId) {
    const prefix = isGlobalSaaS ? "LXC-INV" : "LXC-MISC";
    const pattern = `${prefix}-${yearMonth}-`;
    
    const count = await prisma.payment.count({
      where: {
        invoiceNumber: {
          startsWith: pattern,
        },
      },
    });
    
    const number = (count + 1).toString().padStart(4, "0");
    return `${pattern}${number}`;
  }

  const counter = await prisma.invoiceCounter.upsert({
    where: { schoolId_yearMonth: { schoolId, yearMonth } },
    update: { lastNumber: { increment: 1 } },
    create: { schoolId, yearMonth, lastNumber: 1 },
  });

  const number = counter.lastNumber.toString().padStart(4, "0");
  return `LXC-INV-${yearMonth}-${number}`;
};

export const logInvoiceDownload = async (
  invoiceNumber: string,
  userId: string,
): Promise<void> => {
  await prisma.invoiceLog.create({
    data: { invoiceNumber, userId },
  });
};

export interface GstBreakup {
  mode: "CGST_SGST" | "IGST";
  taxableValue: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
}

export const calculateGstBreakup = (
  taxableValue: number,
  isInterState: boolean,
  gstRate = 18,
): GstBreakup => {
  const base = Number(taxableValue.toFixed(2));

  if (isInterState) {
    const igstAmount = Number(((base * gstRate) / 100).toFixed(2));
    const grandTotal = Number((base + igstAmount).toFixed(2));
    return {
      mode: "IGST",
      taxableValue: base,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: gstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      totalTax: igstAmount,
      grandTotal,
    };
  }

  const halfRate = gstRate / 2;
  const cgstAmount = Number(((base * halfRate) / 100).toFixed(2));
  const sgstAmount = Number(((base * halfRate) / 100).toFixed(2));
  const totalTax = Number((cgstAmount + sgstAmount).toFixed(2));
  const grandTotal = Number((base + totalTax).toFixed(2));

  return {
    mode: "CGST_SGST",
    taxableValue: base,
    cgstRate: halfRate,
    sgstRate: halfRate,
    igstRate: 0,
    cgstAmount,
    sgstAmount,
    igstAmount: 0,
    totalTax,
    grandTotal,
  };
};

export const numberToWords = (num: number): string => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + inWords(n % 100) : "")
      );
    if (n < 1000000)
      return (
        inWords(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + inWords(n % 1000) : "")
      );
    return "";
  };

  return inWords(Math.floor(num)).trim();
};

export const amountInWordsINR = (amount: number): string => {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const rupeesPart =
    rupees === 0 ? "Zero Rupees" : `${numberToWords(rupees)} Rupees`;

  if (paise <= 0) {
    return `${rupeesPart} Only`;
  }

  const paisePart = `${numberToWords(paise)} Paise`;
  return `${rupeesPart} and ${paisePart} Only`;
};

/**
 * Helper to compute explicit extra user charge for a subscription's school.
 * Treats (allowedUsers - planUserLimit) as paid extra seats.
 */
export const calculateExtraUserCharge = async (
  schoolId: string | null | undefined,
  planUserLimit: number | null | undefined,
) => {
  if (!schoolId || !planUserLimit || planUserLimit <= 0) {
    return { extraSeats: 0, extraUserPrice: 0, monthlyCharge: 0 };
  }

  const config = await prisma.schoolSubscriptionConfig.findUnique({
    where: { schoolId },
  });

  if (!config || config.planModel !== "MODEL_B") {
    return { extraSeats: 0, extraUserPrice: 0, monthlyCharge: 0 };
  }

  const extraSeats = Math.max(0, config.allowedUsers - planUserLimit);
  if (extraSeats <= 0) {
    return {
      extraSeats: 0,
      extraUserPrice: config.extraUserPrice,
      monthlyCharge: 0,
    };
  }

  const monthlyCharge = Number((extraSeats * config.extraUserPrice).toFixed(2));
  return { extraSeats, extraUserPrice: config.extraUserPrice, monthlyCharge };
};

export const createPlanInvoice = async (
  subscriptionId: string,
): Promise<{ invoiceNumber: string; url: string } | undefined> => {
  console.log(`[Invoice] Starting invoice generation for subscription: ${subscriptionId}`);
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: true,
      school: { include: { user: true } },
      schoolGroup: { include: { owner: true } },
      payment: true,
      coupon: true,
    },
  });
  if (!subscription) {
    console.warn(`[Invoice] Subscription not found: ${subscriptionId}`);
    return;
  }
  if (!subscription.payment) {
    console.warn(`[Invoice] Payment not found for subscription: ${subscriptionId}`);
    return;
  }

  let invoiceNumber = subscription.payment.invoiceNumber;
  if (!invoiceNumber) {
    console.log(`[Invoice] Generating new invoice number for payment: ${subscription.payment.id}`);
    invoiceNumber = await generateInvoiceNumber(subscription.schoolId, true);
    await prisma.payment.update({
      where: { id: subscription.payment.id },
      data: { invoiceNumber },
    });
    console.log(`[Invoice] Generated invoice number: ${invoiceNumber}`);
  } else {
    console.log(`[Invoice] Using existing invoice number: ${invoiceNumber}`);
  }

  const totalAmount = subscription.payment.amount;

  // Detect billing period to scale extra user charges accordingly
  const start = new Date((subscription as any).startDate || subscription.createdAt);
  const end = new Date((subscription as any).endDate || subscription.createdAt);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const isYearly = diffDays > 300; 
  const periodMultiplier = isYearly ? 12 : 1;

  // Break down base vs. extra-user charges for MODEL_B plans
  const { extraSeats, monthlyCharge: extraUserBaseMonthly } =
    await calculateExtraUserCharge(
      subscription.schoolId,
      subscription.plan.userLimit ?? null,
    );
  
  const extraUserBase = extraUserBaseMonthly * periodMultiplier;
  const planBasePrice = subscription.plan.price * periodMultiplier;

  // Coupon discount (if any) applies only to the base plan price
  let discount = 0;
  if (subscription.coupon) {
    const coupon = subscription.coupon as any;
    const planPrice = subscription.plan.price;
    discount =
      coupon.discountType === "FIXED_AMOUNT"
        ? coupon.discountValue
        : (planPrice * coupon.discountValue) / 100;
  }

  const planBaseAfterDiscount = Math.max(planBasePrice - discount, 0);
  const combinedBase = Number(
    (planBaseAfterDiscount + extraUserBase).toFixed(2),
  );

  const baseAmount = combinedBase;
  const gstAmount = Number((totalAmount - baseAmount).toFixed(2));

  // Determine GST mode (CGST+SGST for Delhi, IGST otherwise)
  const schoolUser: any = subscription.school?.user || subscription.schoolGroup?.owner;
  const placeOfSupplyState: string = schoolUser?.state || "Delhi";
  const isInterState = placeOfSupplyState.toLowerCase() !== "delhi";

  const gstBreakup = calculateGstBreakup(baseAmount, isInterState, 18);

  // Build GST invoice structures
  const seller = {
    ...LEARNXCHAIN_SELLER,
    logoUrl: LEARNXCHAIN_LOGO_URL,
  };

  const buyer: GstInvoiceBuyer = {
    schoolName: subscription.school?.schoolName || subscription.schoolGroup?.name || "Corporate Group",
    addressLines: [schoolUser?.address || ""],
    city: schoolUser?.city || "",
    state: placeOfSupplyState,
    pinCode: schoolUser?.pinCode || "",
    gstin: (subscription.school as any)?.gstin || undefined,
    placeOfSupplyState,
    contactPersonName: schoolUser?.name || "Account Owner",
    contactEmail: schoolUser?.email || "",
    contactPhone: schoolUser?.phone || "",
    logoUrl: subscription.school?.schoolLogo || subscription.schoolGroup?.logo || undefined,
  };

  const lineItems: GstInvoiceLineItem[] = [];

  // Base plan line item
  lineItems.push({
    description: `SaaS Subscription – ${subscription.plan.name}`,
    sacCode: "998313",
    billingPeriodFrom: new Date(
      (subscription as any).startDate || subscription.createdAt,
    ).toLocaleDateString(),
    billingPeriodTo: new Date(
      (subscription as any).endDate ||
        (subscription as any).nextBillingDate ||
        subscription.createdAt,
    ).toLocaleDateString(),
    quantity: 1,
    unitPrice: planBaseAfterDiscount,
    taxableAmount: planBaseAfterDiscount,
    gstRate: 18,
    gstAmount: Number((planBaseAfterDiscount * 0.18).toFixed(2)),
    lineTotal: Number((planBaseAfterDiscount * 1.18).toFixed(2)),
  });

  // Extra user seats line item (if any)
  if (extraSeats > 0 && extraUserBase > 0) {
    const extraGst = Number((extraUserBase * 0.18).toFixed(2));
    lineItems.push({
      description: `Extra User Seats – ${extraSeats} seat(s)`,
      sacCode: "998313",
      billingPeriodFrom: new Date(
        (subscription as any).startDate || subscription.createdAt,
      ).toLocaleDateString(),
      billingPeriodTo: new Date(
        (subscription as any).endDate ||
          (subscription as any).nextBillingDate ||
          subscription.createdAt,
      ).toLocaleDateString(),
      quantity: extraSeats,
      unitPrice: Number((extraUserBase / extraSeats).toFixed(2)),
      taxableAmount: extraUserBase,
      gstRate: 18,
      gstAmount: extraGst,
      lineTotal: Number((extraUserBase + extraGst).toFixed(2)),
    });
  }

  const taxSummary: GstInvoiceTaxSummary = {
    gstType: gstBreakup.mode === "IGST" ? "IGST" : "CGST_SGST",
    taxableValue: gstBreakup.taxableValue,
    cgstRate: gstBreakup.cgstRate,
    sgstRate: gstBreakup.sgstRate,
    igstRate: gstBreakup.igstRate,
    cgstAmount: gstBreakup.cgstAmount,
    sgstAmount: gstBreakup.sgstAmount,
    igstAmount: gstBreakup.igstAmount,
    totalTax: gstBreakup.totalTax,
    grandTotal: gstBreakup.grandTotal,
  };

  const qrImage = await QRCode.toDataURL(
    process.env.BASE_URL
      ? `${process.env.BASE_URL}/api/v1/school/plan/invoice/${subscriptionId}`
      : `LXC-Invoice:${invoiceNumber}`,
  );

  const meta: GstInvoiceMeta = {
    invoiceNumber,
    invoiceDate: new Date(
      subscription.payment.updatedAt ?? subscription.payment.createdAt,
    ).toLocaleDateString(),
    dueDate: new Date(
      subscription.payment.updatedAt ?? subscription.payment.createdAt,
    ).toLocaleDateString(),
    paymentStatus: 
      subscription.payment.status === "COMPLETED" 
        ? "PAID" 
        : subscription.payment.status === "FAILED" 
        ? "FAILED" 
        : "DUE",
    paymentMethod: subscription.payment.paymentMethod || "Online",
    paymentReference:
      (subscription.payment as any).paymentId ||
      (subscription.payment as any).orderId ||
      "",
  };

  const amountInWords = amountInWordsINR(taxSummary.grandTotal);

  const gstInvoice: GstInvoiceData = {
    seller,
    buyer,
    meta,
    lineItems,
    taxSummary,
    amountInWords,
    qrImage,
    notes: `SaaS subscription for LearnXChain plan "${subscription.plan.name}".`,
  };

  const html = generatePlanInvoiceHtml(gstInvoice);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = (await page.pdf({ format: "A4" })) as Buffer;
  await browser.close();

  let invoiceUrl = subscription.payment.invoiceUrl;
  if (!invoiceUrl) {
    console.log(`[Invoice] Uploading PDF for invoice: ${invoiceNumber}`);
    const upload = await uploadFile(
      pdfBuffer,
      "plan_invoices",
      "raw",
      `plan_${invoiceNumber}.pdf`,
    );
    invoiceUrl = upload.url;
    console.log(`[Invoice] PDF uploaded to: ${invoiceUrl}`);
    await prisma.payment.update({
      where: { id: subscription.payment.id },
      data: { invoiceUrl },
    });
    console.log(`[Invoice] Payment record updated with invoice URL.`);
  } else {
    console.log(`[Invoice] Invoice URL already exists: ${invoiceUrl}`);
  }

  const targetEmail = schoolUser?.email;
  if (targetEmail) {
    console.log(`[Invoice] Dispatching email to ${targetEmail} for invoice ${invoiceNumber}`);
    await sendInvoicePdfEmail(
      targetEmail,
      invoiceUrl,
      pdfBuffer,
      invoiceNumber,
    ).catch(err => console.error(`[Invoice] Email dispatch failed for ${invoiceNumber}:`, err));
  } else {
    console.warn(`[Invoice] No contact email found for invoice ${invoiceNumber}. Skipping email dispatch.`);
  }

  console.log(`[Invoice] Successfully generated and processed ${invoiceNumber}`);
  return { invoiceNumber, url: invoiceUrl };
};

export const createFeatureInvoice = async (
  paymentId: string,
): Promise<{ invoiceNumber: string; url: string } | undefined> => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { school: { include: { user: true } } },
  });
  if (!payment || !payment.school) return;

  let invoiceNumber = payment.invoiceNumber;
  if (!invoiceNumber) {
    invoiceNumber = await generateInvoiceNumber(payment.schoolId!, true);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { invoiceNumber },
    });
  }

  // Parse "Feature Activation (Yearly|Monthly): Feature Name" from description
  const desc = payment.description || "";
  
  // Robustly extract billing period and feature name
  // Format 1: "Feature Activation (3 Years|Yearly|Monthly) [Coupon: ...]: Feature Name"
  // Format 2: "Feature Activation (3 Years|Yearly|Monthly): Feature Name"
  const periodMatch = desc.match(/\((3 Years|Yearly|Monthly)\)/i);
  const billingPeriod = periodMatch ? periodMatch[1] : "Monthly";
  
  let featureName = "Feature Activation";
  const nameMatch = desc.match(/:\s*(.+)$/);
  if (nameMatch) {
    featureName = nameMatch[1].trim();
  } else {
    featureName = desc.replace(/^Feature Activation\s*(\([^)]+\))?\s*/i, "").trim() || "Feature Activation";
  }

  const totalAmount = payment.amount;
  // If amount is 0, baseAmount is 0
  const baseAmount = totalAmount > 0 ? Number((totalAmount / 1.18).toFixed(2)) : 0;

  const schoolUser: any = payment.school.user;
  const placeOfSupplyState: string = schoolUser?.state || "Delhi";
  const isInterState = placeOfSupplyState.toLowerCase() !== "delhi";
  const gstBreakup = calculateGstBreakup(baseAmount, isInterState, 18);

  const seller = { ...LEARNXCHAIN_SELLER, logoUrl: LEARNXCHAIN_LOGO_URL };

  const buyer: GstInvoiceBuyer = {
    schoolName: payment.school.schoolName,
    addressLines: [schoolUser?.address || ""],
    city: schoolUser?.city || "",
    state: placeOfSupplyState,
    pinCode: schoolUser?.pinCode || "",
    gstin: (payment.school as any)?.gstin || undefined,
    placeOfSupplyState,
    contactPersonName: schoolUser?.name || "Account Owner",
    contactEmail: schoolUser?.email,
    contactPhone: schoolUser?.phone || "",
    logoUrl: (payment.school as any).schoolLogo || undefined,
  };

  const activatedOn = new Date(payment.updatedAt ?? payment.createdAt);
  const periodEnd = new Date(activatedOn);
  if (billingPeriod.toLowerCase() === "yearly") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else if (billingPeriod.toLowerCase() === "3 years") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 3);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const lineItems: GstInvoiceLineItem[] = [
    {
      description: `Feature Activation – ${featureName} (${billingPeriod})`,
      sacCode: "998313",
      billingPeriodFrom: activatedOn.toLocaleDateString(),
      billingPeriodTo: periodEnd.toLocaleDateString(),
      quantity: 1,
      unitPrice: baseAmount,
      taxableAmount: baseAmount,
      gstRate: 18,
      gstAmount: gstBreakup.totalTax,
      lineTotal: gstBreakup.grandTotal,
    },
  ];

  const taxSummary: GstInvoiceTaxSummary = {
    gstType: gstBreakup.mode === "IGST" ? "IGST" : "CGST_SGST",
    taxableValue: gstBreakup.taxableValue,
    cgstRate: gstBreakup.cgstRate,
    sgstRate: gstBreakup.sgstRate,
    igstRate: gstBreakup.igstRate,
    cgstAmount: gstBreakup.cgstAmount,
    sgstAmount: gstBreakup.sgstAmount,
    igstAmount: gstBreakup.igstAmount,
    totalTax: gstBreakup.totalTax,
    grandTotal: gstBreakup.grandTotal,
  };

  const meta: GstInvoiceMeta = {
    invoiceNumber,
    invoiceDate: activatedOn.toLocaleDateString(),
    dueDate: activatedOn.toLocaleDateString(),
    paymentStatus: 
      payment.status === "COMPLETED" 
        ? "PAID" 
        : payment.status === "FAILED" 
        ? "FAILED" 
        : "DUE",
    paymentMethod: payment.paymentMethod || "Online",
    paymentReference:
      payment.razorpayPaymentId || payment.razorpayOrderId || "",
  };

  const gstInvoice: GstInvoiceData = {
    seller,
    buyer,
    meta,
    lineItems,
    taxSummary,
    amountInWords: amountInWordsINR(taxSummary.grandTotal),
    qrImage: await QRCode.toDataURL(
      process.env.BASE_URL
        ? `${process.env.BASE_URL}/api/v1/finance/feature/invoice/${paymentId}`
        : `LXC-Invoice:${invoiceNumber}`,
    ),
    notes: `Feature activation for "${featureName}" – ${billingPeriod} billing period.`,
  };

  const html = generatePlanInvoiceHtml(gstInvoice);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = (await page.pdf({ format: "A4" })) as Buffer;
  await browser.close();

  let invoiceUrl = payment.invoiceUrl;
  if (!invoiceUrl) {
    const upload = await uploadFile(
      pdfBuffer,
      "plan_invoices",
      "raw",
      `feature_${invoiceNumber}.pdf`,
    );
    invoiceUrl = upload.url;
    await prisma.payment.update({
      where: { id: payment.id },
      data: { invoiceUrl },
    });
  }

  await sendInvoicePdfEmail(
    payment.school.user.email,
    invoiceUrl,
    pdfBuffer,
    invoiceNumber,
  );
  return { invoiceNumber, url: invoiceUrl };
};

// Deprecated logic placeholders
export const createFeeInvoice = async (paymentId: string) => {
  console.warn("createFeeInvoice is deprecated. Use ReceiptService.");
  return undefined;
};

export const createCashFeeReceipts = async (
  paymentId: string,
  receivedBy: string,
  paymentMode: string = "Cash",
) => {
  console.warn("createCashFeeReceipts is deprecated. Use ReceiptService.");
  return undefined;
};
