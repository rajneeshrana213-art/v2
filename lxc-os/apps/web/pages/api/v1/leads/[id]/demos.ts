
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
      const { scheduledAt, notes, meetingLink } = req.body;
      if (!scheduledAt) return res.status(400).json({ error: "Missing scheduledAt" });

      const demo = await LeadsService.scheduleDemo(id as string, {
        scheduledAt: new Date(scheduledAt),
        notes,
        meetingLink,
        conductedById: user.id
      });

      return res.status(201).json(demo);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Lead Demo API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
