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
    const { schoolId, academicYearId, classId } = req.query;

    if (!schoolId || typeof schoolId !== "string") {
      return res.status(400).json({ error: "School ID is required" });
    }

    let finalAcademicYearId = academicYearId as string | undefined;

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

    // 1. Get all students (optimized: only id needed initially)
    const students = await prisma.student.findMany({
      where: { 
        schoolId, 
        status: "ACTIVE",
        classId: classId ? (classId as string) : undefined
      },
      select: { id: true },
    });
    const studentIds = students.map((s) => s.id);

    // 2. Efficiently compute balances
    const balances = await DashboardOptimizationService.getAllStudentBalances(
      schoolId,
      finalAcademicYearId,
      studentIds
    );

    // 3. Get Defaulters List
    const defaulters = await DashboardOptimizationService.getDefaultersList(
      schoolId,
      balances,
      100 // Limit to top 100 defaulters
    );

    return res.status(200).json(defaulters);
  } catch (error: any) {
    console.error("Defaulters API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
