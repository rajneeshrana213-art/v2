import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";
import multiparty from "multiparty";
import fs from "fs";
import { FinanceImportService, FeePlanImportRow } from "@/lib/services/finance/FinanceImportService";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = new multiparty.Form();
    const data: any = await new Promise((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: any, files: any) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const file = data.files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: "No CSV file uploaded" });
    }

    const { schoolId, academicYearId, userId } = data.fields;
    const sid = schoolId?.[0];
    const uid = userId?.[0];
    let aid = academicYearId?.[0];

    if (!sid || !uid) {
      return res.status(400).json({ error: "Missing schoolId or userId" });
    }

    if (!aid) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { schoolId: sid, isActive: true },
        orderBy: { createdAt: "desc" },
      });
      if (!activeYear) return res.status(400).json({ error: "No active academic year found." });
      aid = activeYear.id;
    }

    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // raw: true is default, we cast values if needed here.
    const records = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];

    const result = await FinanceImportService.importFeePlans(sid, aid, records as FeePlanImportRow[], uid);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Fee Plan Import API Error:", error);
    return res.status(500).json({ error: error.message || "Failed to process import" });
  }
}
