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

    // Need student class info mapping
    const students = await prisma.student.findMany({
      where: { schoolId, status: "ACTIVE" },
      select: { 
        id: true,
        class: {
            select: { id: true, name: true }
        }
      },
    });
    
    const studentIds = students.map((s) => s.id);
    const studentClassMap = new Map<string, { id: string; name: string }>();
    students.forEach(s => {
        if (s.class) {
            studentClassMap.set(s.id, { id: s.class.id, name: s.class.name });
        }
    });

    const balances = await DashboardOptimizationService.getAllStudentBalances(
      schoolId,
      finalAcademicYearId,
      studentIds
    );

    const classReceivables = await DashboardOptimizationService.getClassReceivablesOptimized(
      schoolId,
      balances,
      studentClassMap
    );

    return res.status(200).json(classReceivables);
  } catch (error: any) {
    console.error("Class Receivables API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
