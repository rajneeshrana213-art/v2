
import { NextApiRequest, NextApiResponse } from "next";
import { AccountsDashboardService } from "@/lib/services/dashboard/accounts-dashboard-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  try {
    const data = await AccountsDashboardService.getDashboardData();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Failed to fetch accounts dashboard data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
