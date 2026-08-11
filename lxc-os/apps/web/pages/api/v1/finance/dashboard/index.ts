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
    const { schoolId, academicYearId } = req.query;

    if (!schoolId || typeof schoolId !== "string") {
      return res.status(400).json({ error: "School ID is required" });
    }

    if (!academicYearId || typeof academicYearId !== "string") {
      return res.status(400).json({ error: "Academic Year ID is required" });
    }

    // 1. Get all students for the school
    const students = await prisma.student.findMany({
      where: { schoolId, status: "ACTIVE" },
      select: { id: true },
    });
    const studentIds = students.map((s) => s.id);

    // 2. Get Balances (Batched & Optimized)
    const balances = await DashboardOptimizationService.getAllStudentBalances(
      schoolId,
      academicYearId,
      studentIds
    );

    // 3. Compute Summary
    const summary = DashboardOptimizationService.getSummaryFromBalances(balances);

    // 4. Compute Aging Analysis
    const aging = await DashboardOptimizationService.getAgingAnalysisOptimized(
      schoolId,
      academicYearId,
      balances
    );

    return res.status(200).json({
      summary,
      aging,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
