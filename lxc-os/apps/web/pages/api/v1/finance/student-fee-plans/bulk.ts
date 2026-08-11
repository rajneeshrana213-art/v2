import { NextApiRequest, NextApiResponse } from "next";
import { StudentFeePlanService } from "@/lib/services/finance/StudentFeePlanService";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";

const bulkAssignSchema = z.object({
  academicYearId: z.string().min(1),
  feeStructureId: z.string().min(1),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = authResult;
  if (!user || !user.schoolId) {
    return res.status(401).json({ error: "Unauthorized: School ID not found" });
  }

  try {
    const result = bulkAssignSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    const report = await StudentFeePlanService.bulkAssignFeeStructure({
      schoolId: user.schoolId,
      ...result.data,
      createdBy: user.id,
    });

    return res.status(200).json({
      message: `Successfully assigned fee structure to ${report.count} students`,
      ...report,
    });
  } catch (error: any) {
    console.error("Bulk Assignment API Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
