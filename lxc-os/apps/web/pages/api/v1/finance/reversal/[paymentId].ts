import { NextApiRequest, NextApiResponse } from "next";
import { ReversalService } from "@/lib/services/finance/ReversalService";
import { reversePaymentSchema } from "@/lib/validations/finance";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentId } = req.query;

    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    // Merge body with query for validation
    const body = { ...req.body, paymentId };
    const result = reversePaymentSchema.safeParse(body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    const { reason } = result.data;
    const { schoolId, academicYearId, userId } = req.body; // Context

    if (!schoolId || !academicYearId || !userId) {
       return res.status(400).json({ error: "Missing context (schoolId, academicYearId, userId)" });
    }

    const reversal = await ReversalService.reversePayment({
      schoolId,
      academicYearId,
      paymentId: paymentId as string,
      reason,
      createdBy: userId,
    });

    return res.status(200).json(reversal);
  } catch (error: any) {
    console.error("Reversal API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
