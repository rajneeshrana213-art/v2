import { NextApiRequest, NextApiResponse } from "next";
import { PaymentSettlementService } from "@/lib/services/finance/PaymentSettlementService";
import { ReceiptService } from "@/lib/services/finance/ReceiptService";
import { collectPaymentSchema } from "@/lib/validations/finance";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import * as fcmTriggers from "@/lib/services/notification/fcm-trigger-service";

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
    const result = collectPaymentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    const {
      studentId,
      amount,
      paymentMethod,
      referenceNumber,
      bankName,
      branchName,
      chequeDate,
      remarks,
      shouldSendReceipt,
    } = result.data;

    // TODO: Extract from Auth Middleware
    const { schoolId, academicYearId, userId } = req.body; // Expecting these from body/middleware for now

    if (!schoolId || !userId) {
      return res
        .status(400)
        .json({ error: "Missing context (schoolId, userId)" });
    }

    let finalAcademicYearId = academicYearId as string | undefined;

    // Allow academicYearId to be omitted by inferring active year for the school
    if (!finalAcademicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
        orderBy: { createdAt: "desc" },
      });

      if (!activeYear) {
        return res
          .status(400)
          .json({ error: "Academic Year ID is required" });
      }

      finalAcademicYearId = activeYear.id;
    }

    // 1. Collect Payment
    const payment = await PaymentSettlementService.collectPayment({
      schoolId,
      academicYearId: finalAcademicYearId,
      studentId,
      amount,
      paymentMethod,
      referenceNumber,
      bankName,
      branchName,
      chequeDate: chequeDate ? new Date(chequeDate) : undefined,
      description: remarks || "Fee Payment",
      collectedBy: userId,
    });

    // 2. Generate Receipt automatically (and notify if requested)
    let receiptData = null;
    try {
      receiptData = await ReceiptService.generateReceiptForPayment(
        payment.id,
        !!shouldSendReceipt
      );
    } catch (receiptError) {
      console.error("Receipt generation failed:", receiptError);
      // Do not fail the request if receipt fails, just warn
    }

    // 🕑4 Notify student + parents of payment confirmation (fire-and-forget)
    fcmTriggers.notifyPaymentReceived(studentId, amount, schoolId);

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
        receipt: receiptData,
      },
    });
  } catch (error: any) {
    console.error("Payment Collection Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
