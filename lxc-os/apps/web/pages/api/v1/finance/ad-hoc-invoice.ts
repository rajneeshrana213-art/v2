import { NextApiRequest, NextApiResponse } from "next";
import { AdHocInvoiceService } from "@/lib/services/finance/AdHocInvoiceService";
import { createAdHocInvoiceSchema } from "@/lib/validations/finance";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === "POST") {
    try {
      const result = createAdHocInvoiceSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const { studentId, items, dueDate, remarks } = result.data;
      const { schoolId, academicYearId, userId } = req.body; // Context

      if (!schoolId || !userId) {
        return res
          .status(400)
          .json({ error: "Missing context (schoolId, userId)" });
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
            .json({ error: "Academic Year ID required" });
        }

        finalAcademicYearId = activeYear.id;
      }

      // Normalize simple item payload into the richer AdHocInvoiceItem structure
      const normalizedItems = items.map((item) => ({
        description: item.description,
        quantity: 1,
        unitPrice: item.amount,
        total: item.amount,
      }));

      const invoice = await AdHocInvoiceService.createInvoice({
        schoolId,
        academicYearId: finalAcademicYearId,
        studentId,
        items: normalizedItems,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: remarks,
        createdBy: userId,
      });

      return res.status(201).json(invoice);
    } catch (error: any) {
      console.error("Ad-Hoc Invoice API Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  } else if (req.method === "GET") {
    try {
      const { studentId, schoolId, academicYearId } = req.query;

      if (!studentId || typeof studentId !== "string") {
        return res.status(400).json({ error: "Student ID required" });
      }

      if (!schoolId || typeof schoolId !== "string") {
        return res.status(400).json({ error: "School ID required" });
      }

      // Resolve academicYearId — use the provided one or fall back to the active year
      let resolvedAcademicYearId = typeof academicYearId === "string" ? academicYearId : undefined;
      if (!resolvedAcademicYearId) {
        const activeYear = await prisma.academicYear.findFirst({
          where: { schoolId, isActive: true },
          orderBy: { createdAt: "desc" },
        });
        if (!activeYear) {
          return res.status(400).json({ error: "No active academic year found for this school." });
        }
        resolvedAcademicYearId = activeYear.id;
      }

      const invoices = await AdHocInvoiceService.getStudentInvoices(
        schoolId,
        resolvedAcademicYearId,
        studentId
      );

      return res.status(200).json(invoices);
    } catch (error: any) {
      console.error("Ad-Hoc Invoice GET API Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
