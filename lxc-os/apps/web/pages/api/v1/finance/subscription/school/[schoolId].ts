
import { NextApiRequest, NextApiResponse } from "next";
import { TransactionService } from "../../../../../../lib/services/finance/transaction-service";
import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "../../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const { schoolId } = req.query;
    const data = await TransactionService.getSchoolSubscriptions(schoolId as string);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
}
