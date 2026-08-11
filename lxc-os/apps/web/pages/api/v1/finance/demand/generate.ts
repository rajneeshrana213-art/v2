import { NextApiRequest, NextApiResponse } from "next";
import { DemandGenerationService } from "@/lib/services/finance/DemandGenerationService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { academicYearId, studentIds, month, year } = req.body;

  if (!academicYearId) {
    return res.status(400).json({ error: "academicYearId is required" });
  }

  try {
    const results = await DemandGenerationService.generateDemand({
      schoolId: user.schoolId,
      academicYearId,
      studentIds,
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      createdBy: user.userId,
    });

    return res.status(200).json({
      message: `Demand generated for ${results.length} students`,
      results,
    });
  } catch (error: any) {
    console.error("Demand Generation Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
