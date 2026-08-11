import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { PaymentSettlementService } from "@/lib/services/finance/PaymentSettlementService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { studentId, schoolId, academicYearId } = req.query;

    if (!studentId || typeof studentId !== "string") {
      return res.status(400).json({ error: "Student ID is required" });
    }

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

    // 1. Fetch Summary Balance
    const balance = await PaymentSettlementService.getStudentBalance(
      schoolId,
      finalAcademicYearId,
      studentId
    );

    // 2. Fetch Student Profile for Header
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    // 3. Fetch Detailed Ledger
    const ledger = await prisma.financeLedger.findMany({
      where: {
        schoolId,
        academicYearId: finalAcademicYearId,
        studentId,
      },
      include: {
        debitAccount: { select: { name: true, code: true } },
        creditAccount: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      studentId,
      studentProfile: student ? {
        name: student.user.name,
        admissionNo: student.admissionNo,
        className: student.class?.name || "N/A",
      } : null,
      balance,
      ledger: ledger.map((entry) => {
        let invoiceUrl: string | undefined;
        let cleanDescription = entry.description;

        if (entry.description) {
          const urlMatch = entry.description.match(/\|\|\|url:(.+)/);
          if (urlMatch && urlMatch[1]) {
            invoiceUrl = urlMatch[1];
            cleanDescription = entry.description.replace(/\|\|\|url:.+/, "").trim();
          }
        }

        return {
          id: entry.id,
          date: entry.createdAt,
          type: entry.transactionType,
          description: cleanDescription,
          invoiceUrl,
          amount: entry.amount,
          debit: entry.debitAccount.name,
          credit: entry.creditAccount.name,
        };
      }),
    });
  } catch (error: any) {
    console.error("Ledger API Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
