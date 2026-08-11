import { NextApiRequest, NextApiResponse } from "next";
import { AuditService } from "@/lib/services/finance/AuditService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { schoolId, startDate, endDate } = req.query;

    if (!schoolId || typeof schoolId !== "string") {
      return res.status(400).json({ error: "School ID is required" });
    }

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      // Default: last 30 days
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 30);
    }

    const report = await AuditService.generateSecurityReport(schoolId, start, end);

    return res.status(200).json(report);
  } catch (error: any) {
    console.error("Audit Security Report API Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}


