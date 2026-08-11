import { NextApiRequest, NextApiResponse } from "next";
import { FinanceReportingService } from "@/lib/services/finance/FinanceReportingService";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  let { academicYearId } = req.query;

  // If no academicYearId supplied, resolve the active one for this school
  if (!academicYearId) {
    const activeYear = await prisma.academicYear.findFirst({
      where: { schoolId: user.schoolId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    if (!activeYear) {
      return res.status(400).json({ error: "No active academic year found for this school." });
    }
    academicYearId = activeYear.id;
  }

  try {
    const [data, trend] = await Promise.all([
      FinanceReportingService.getCollectionByHead(user.schoolId, academicYearId as string),
      FinanceReportingService.getMonthlyTrend(user.schoolId, academicYearId as string),
    ]);

    return res.status(200).json({ ...data, trend });
  } catch (error: any) {
    console.error("Collection Summary API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
