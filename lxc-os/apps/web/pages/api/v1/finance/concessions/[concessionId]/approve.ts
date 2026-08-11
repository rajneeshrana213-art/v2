import { NextApiRequest, NextApiResponse } from "next";
import { ConcessionService } from "@/lib/services/finance/ConcessionService";
import { approveConcessionSchema } from "@/lib/validations/finance";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { concessionId } = req.query;

    if (!concessionId || typeof concessionId !== "string") {
        return res.status(400).json({ error: "Concession ID is required" });
    }
    
    // Merge context
    const { userId } = req.body; // Context (Admin ID) not approvedBy from body
    // Wait, typical use case: User making request is the approver.
    
    if (!userId) {
       return res.status(400).json({ error: "Missing context (userId)" });
    }

    // validate
    const validation = approveConcessionSchema.safeParse({ concessionId, approvedBy: userId });
    
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const concession = await ConcessionService.approveConcession(concessionId, userId);

    return res.status(200).json(concession);
  } catch (error: any) {
    console.error("Approve Concession API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
