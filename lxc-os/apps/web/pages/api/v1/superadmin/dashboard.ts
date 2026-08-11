import { NextApiRequest, NextApiResponse } from "next";
import { SuperAdminService } from "@/lib/services/dashboard/super-admin-service";
import { verifyAuth } from "@/lib/auth";
import { cache } from "@/lib/cache";

const CACHE_KEY = "superadmin:dashboard";
const CACHE_TTL = 60; // 60 seconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Super Admin access required" });
    }

    // Serve from cache when available
    const cached = await cache.get(CACHE_KEY);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cached);
    }

    const data = await SuperAdminService.getDashboardData();
    await cache.set(CACHE_KEY, data, CACHE_TTL);
    res.setHeader("X-Cache", "MISS");
    return res.status(200).json(data);
  } catch (error) {
    console.error("Failed to fetch super admin dashboard data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
