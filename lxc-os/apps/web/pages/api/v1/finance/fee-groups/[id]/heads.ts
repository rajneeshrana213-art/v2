import { NextApiRequest, NextApiResponse } from "next";
import { FeeStructureService } from "@/lib/services/finance/FeeStructureService";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const headAmountsSchema = z.array(
  z.object({
    feeHeadId: z.string().min(1),
    amount: z.number().min(0),
  })
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Structure ID is required" });
  }

  const { method } = req;

  if (method === "GET") {
    try {
      const heads = await FeeStructureService.getFeeHeadAmounts(id);
      return res.status(200).json(heads);
    } catch (error: any) {
      console.error("Get Fee Head Amounts Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else if (method === "POST" || method === "PUT") {
    try {
      const result = headAmountsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      await FeeStructureService.setFeeHeadAmounts(id, result.data);
      return res.status(200).json({ message: "Fee head amounts updated" });
    } catch (error: any) {
      console.error("Set Fee Head Amounts Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}
