
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { TransactionService } from "@/lib/services/finance/transaction-service";
import { NextApiRequest, NextApiResponse } from "next";
// import { TransactionService } from "../../../../../lib/services/finance/transaction-service";
// import { verifyAuth } from "../../../../../lib/auth";
// import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    const { studentId } = req.query;
    const data = await TransactionService.getStudentTransactions(studentId as string);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
}
