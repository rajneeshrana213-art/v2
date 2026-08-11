import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);

    if (!user || user.role !== "admin" || !user.schoolId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const stats = await SubscriptionService.getUsageStats(user.schoolId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Usage stats error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch usage stats",
    });
  }
}
