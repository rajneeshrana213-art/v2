
import { NextApiRequest, NextApiResponse } from "next";
import { LeadsService } from "../../../../../lib/services/leads-service";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const { id } = req.query;
  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (req.method === "POST") {
      const { content, scheduledAt, status } = req.body;
      if (!content || !scheduledAt) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const followUp = await LeadsService.addFollowUp(id as string, {
        content,
        scheduledAt: new Date(scheduledAt),
        status
      });

      return res.status(201).json(followUp);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Lead Follow-up API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
