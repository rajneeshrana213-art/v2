import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/lib/middleware/api-guard";
import { SystemHealthService } from "@/lib/services/superadmin/dashboard/SystemHealthService";
import { Role } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await SystemHealthService.getUserDetailedActivity(id, page, limit);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("User Stats API Error:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth(handler, [Role.superadmin]);
