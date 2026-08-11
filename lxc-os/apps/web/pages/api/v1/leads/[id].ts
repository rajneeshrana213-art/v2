
import { NextApiRequest, NextApiResponse } from "next";
import { LeadsService } from "../../../../lib/services/leads-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const { id } = req.query;
  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      const lead = await LeadsService.getLeadById(id as string);
      if (!lead) return res.status(404).json({ error: "Lead not found" });
      return res.status(200).json(lead);
    } 
    
    if (req.method === "PATCH") {
      const lead = await LeadsService.updateLead(id as string, req.body);
      return res.status(200).json(lead);
    }

    if (req.method === "DELETE") {
      await LeadsService.deleteLead(id as string);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Lead ID API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
