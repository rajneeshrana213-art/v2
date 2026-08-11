import { NextApiRequest, NextApiResponse } from "next";
import { DashboardOptimizationService } from "@/lib/services/finance/DashboardOptimizationService";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { schoolId, academicYearId, studentId, classId } = req.query;

    if (!schoolId || typeof schoolId !== "string") {
      return res.status(400).json({ error: "School ID is required" });
    }

    let finalAcademicYearId = academicYearId as string | undefined;

    // If academicYearId is not provided, attempt to use the active academic year for the school
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

    let studentIds: string[] = [];
    if (studentId && typeof studentId === "string") {
      studentIds = [studentId];
    } else {
      const students = await prisma.student.findMany({
        where: { 
          schoolId, 
          status: "ACTIVE",
          classId: classId ? (classId as string) : undefined
        },
        select: { id: true },
      });
      studentIds = students.map((s) => s.id);
    }

    const balances = await DashboardOptimizationService.getAllStudentBalances(
      schoolId,
      finalAcademicYearId,
      studentIds
    );

    const summary = DashboardOptimizationService.getSummaryFromBalances(
      balances
    );

    return res.status(200).json(summary);
  } catch (error: any) {
    console.error("Outstanding Summary API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
