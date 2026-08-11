import { NextApiRequest, NextApiResponse } from "next";
import { FeeHeadService } from "@/lib/services/finance/FeeHeadService";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const feeHeadSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  revenueAccountId: z.string().min(1),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
  type: z.enum(["ONE_TIME", "RECURRING"]).optional(),
  frequency: z
    .enum(["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY", "CUSTOM"])
    .optional(),
  isMandatory: z.boolean().optional(),
  isConcessionEligible: z.boolean().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { method } = req;

  if (method === "GET") {
    try {
      const { schoolId, isActive } = req.query;
      const targetSchoolId = (schoolId as string) || user.schoolId;

      if (!targetSchoolId) {
        return res.status(400).json({ error: "School ID is required" });
      }

      const feeHeads = await FeeHeadService.getFeeHeads(targetSchoolId, {
        isActive: isActive ? isActive === "true" : undefined,
      });
      return res.status(200).json(feeHeads);
    } catch (error: any) {
      console.error("Get Fee Heads Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else if (method === "POST") {
    try {
      const result = feeHeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const feeHead = await FeeHeadService.createFeeHead(result.data);
      return res.status(201).json(feeHead);
    } catch (error: any) {
      console.error("Create Fee Head Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else if (method === "PUT") {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID is required" });
      }

      const result = feeHeadSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const feeHead = await FeeHeadService.updateFeeHead(id, result.data);
      return res.status(200).json(feeHead);
    } catch (error: any) {
      console.error("Update Fee Head Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else if (method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID is required" });
      }

      await FeeHeadService.deleteFeeHead(id);
      return res.status(200).json({ message: "Fee head deleted successfully" });
    } catch (error: any) {
      console.error("Delete Fee Head Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}
