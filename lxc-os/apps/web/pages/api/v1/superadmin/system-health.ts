import { NextApiRequest, NextApiResponse } from "next";
import { SystemHealthService } from "@/lib/services/superadmin/dashboard/SystemHealthService";
import { verifyAuth } from "@/lib/auth";
import Logger from "@/lib/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  try {
    const metrics = await SystemHealthService.getDetailedSystemHealth();
    return res.status(200).json(metrics);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
