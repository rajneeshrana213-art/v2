import { NextApiRequest, NextApiResponse } from "next";
import { DashboardService } from "../../../../lib/services/dashboard";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "../../../../lib/middleware/cors";
import { cache } from "../../../../lib/cache";

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
      return res
        .status(403)
        .json({ error: "Access denied. Group Admin role required." });
    }

    if (!user.schoolGroupId) {
      return res
        .status(400)
        .json({ error: "User is not associated with a school group" });
    }

    const cacheKey = `dashboard:group-admin:${user.schoolGroupId}`;
    const cached = cache.get<object>(cacheKey);
    if (cached) {
      res.setHeader(
        "Cache-Control",
        "public, max-age=300, stale-while-revalidate=60",
      );
      return res.status(200).json(cached);
    }

    const data = await DashboardService.groupAdmin.getDashboardData(
      user.schoolGroupId,
    );

    // Cache for 5 minutes
    cache.set(cacheKey, data, 300);

    res.setHeader(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=60",
    );
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Group Admin Dashboard API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
