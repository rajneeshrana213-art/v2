import { NextApiRequest, NextApiResponse } from "next";
import { StudentFeePlanService } from "@/lib/services/finance/StudentFeePlanService";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const assignSchema = z.object({
  schoolId: z.string().min(1),
  academicYearId: z.string().min(1),
  studentId: z.string().min(1),
  feeStructureId: z.string().min(1),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { method } = req;

  if (method === "GET") {
    try {
      const { schoolId, academicYearId, studentId } = req.query;
      const targetSchoolId = (schoolId as string) || user.schoolId;

      if (!targetSchoolId || !academicYearId) {
        return res
          .status(400)
          .json({ error: "School ID and Academic Year ID are required" });
      }

      if (studentId) {
        const plan = await StudentFeePlanService.getStudentFeePlan(
          targetSchoolId,
          academicYearId as string,
          studentId as string
        );
        return res.status(200).json(plan);
      } else {
        const assignments = await StudentFeePlanService.listAssignments(
          targetSchoolId,
          academicYearId as string
        );
        return res.status(200).json(assignments);
      }
    } catch (error: any) {
      console.error("Get Student Fee Plan Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else if (method === "POST") {
    try {
      const result = assignSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const plan = await StudentFeePlanService.assignFeeStructure({
        ...result.data,
        createdBy: user.id,
      });
      return res.status(201).json(plan);
    } catch (error: any) {
      console.error("Assign Fee Structure Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}
