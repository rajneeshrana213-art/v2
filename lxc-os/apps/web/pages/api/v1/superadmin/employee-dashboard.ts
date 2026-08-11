import { NextApiRequest, NextApiResponse } from "next";
import { SuperAdminService } from "@/lib/services/dashboard/super-admin-service";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden: Super Admin access required" });
  }

  try {
    const data = await SuperAdminService.getEmployeeDashboardData();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Failed to fetch employee dashboard data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
