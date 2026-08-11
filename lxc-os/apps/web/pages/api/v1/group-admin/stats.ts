import { NextApiRequest, NextApiResponse } from "next";
import { DashboardService } from "../../../../lib/services/dashboard";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "../../../../lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const user = (req as any).user;

    if (user.role !== "group_admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!user.schoolGroupId) {
      return res
        .status(400)
        .json({ error: "User is not associated with a school group" });
    }

    const stats = await DashboardService.groupAdmin.getDetailedAnalytics(
      user.schoolGroupId,
    );
    res.status(200).json(stats);
  } catch (error: any) {
    console.error("Group Admin Stats API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
