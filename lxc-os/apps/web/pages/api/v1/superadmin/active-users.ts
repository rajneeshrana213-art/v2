import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/lib/middleware/api-guard";
import { SystemHealthService } from "@/lib/services/superadmin/dashboard/SystemHealthService";
import { Role } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const days = parseInt(req.query.days as string) || 5;
    const data = await SystemHealthService.getDetailedActiveUsers(days);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Active Users API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth(handler, [Role.superadmin]);
