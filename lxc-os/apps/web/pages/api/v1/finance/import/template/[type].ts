import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type } = req.query;

  let data: any[] = [];
  let filename = "template.xlsx";

  switch (type) {
    case "accounts":
      data = [{ code: "F1001", name: "Library Fee", type: "REVENUE", description: "Annual library fee" }];
      filename = "accounts_template.xlsx";
      break;
    case "fee-plans":
      data = [{ admissionNo: "ADM-001", feeStructureId: "cmkpxxxxx0000..." }];
      filename = "fee_plans_template.xlsx";
      break;
    case "balances":
      data = [{ admissionNo: "ADM-001", revenueAccountCode: "F1001", amount: 500.00, description: "Previous Year Dues", date: "2024-04-01" }];
      filename = "opening_balances_template.xlsx";
      break;
    default:
      return res.status(400).json({ error: "Invalid template type" });
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(buffer);
}
