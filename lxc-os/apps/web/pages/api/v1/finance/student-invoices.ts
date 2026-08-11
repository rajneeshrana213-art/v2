import { NextApiRequest, NextApiResponse } from "next";
import { FeeEngineService } from "@/lib/services/finance/FeeEngineService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const { method } = req;
  const { studentId, academicYearId } = req.query;

  if (method === "GET") {
    try {
      if (!studentId || !academicYearId) {
        return res
          .status(400)
          .json({ error: "studentId and academicYearId are required" });
      }

      const invoices = await FeeEngineService.getStudentInvoices(
        studentId as string,
        academicYearId as string,
      );
      return res.status(200).json(invoices);
    } catch (error: any) {
      console.error("Get Student Invoices Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}
