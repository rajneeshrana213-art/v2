import { NextApiRequest, NextApiResponse } from "next";
import { HostelFeeService } from "@/lib/services/hostel/HostelFeeService";
import { createHostelFeeSchema } from "@/lib/validations/hostel";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      const fees = await HostelFeeService.getAllFees();
      return res.status(200).json(fees);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const result = createHostelFeeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const fee = await HostelFeeService.createFee(result.data);
      return res.status(201).json(fee);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
