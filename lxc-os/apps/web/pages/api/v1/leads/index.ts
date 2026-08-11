
import { NextApiRequest, NextApiResponse } from "next";
import { LeadsService } from "../../../../lib/services/leads-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";
import { LeadStatus } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      const { searchTerm, status, page, limit } = req.query;
      
      const leadsData = await LeadsService.getLeads({
        userId: user.role === 'employee' ? user.id : undefined,
        searchTerm: searchTerm as string,
        status: status as LeadStatus,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      
      return res.status(200).json(leadsData);
    } 
    
    if (req.method === "POST") {
      const { name, schoolName, phone, email, source, address } = req.body;
      
      if (!name || !schoolName || !phone) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const lead = await LeadsService.createLead({
        name,
        schoolName,
        phone,
        email,
        source,
        address,
        assignedToId: user.id
      });

      return res.status(201).json(lead);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Leads API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
