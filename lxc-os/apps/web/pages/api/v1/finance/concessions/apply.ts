import { NextApiRequest, NextApiResponse } from "next";
import { ConcessionService } from "@/lib/services/finance/ConcessionService";
import { applyConcessionSchema } from "@/lib/validations/finance";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = applyConcessionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    const { studentFeePlanId, feeHeadId, amount, type, reason, autoApprove, schoolId, userId } = result.data;

    const concession = await ConcessionService.applyConcession({
        schoolId,
        studentFeePlanId,
        feeHeadId: feeHeadId || undefined,
        amount,
        type,
        reason,
        approvedBy: autoApprove ? userId : undefined,
    });

    return res.status(201).json(concession);
  } catch (error: any) {
    console.error("Apply Concession API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
