
import { NextApiRequest, NextApiResponse } from "next";
import { DashboardService } from "../../../../lib/services/dashboard";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "../../../../lib/middleware/cors";
import { cache } from "../../../../lib/cache";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const user = (req as any).user;

    if (!user.schoolId) {
        return res.status(400).json({ error: "User is not associated with a school" });
    }

    const filters = {
        attendanceDate: req.query.attendanceDate as string,
        classFilter: req.query.classFilter as string,
        activityFilter: req.query.activityFilter as string,
        todoFilter: req.query.todoFilter as string,
        feesFilter: req.query.feesFilter as string,
        leaveFilter: req.query.leaveFilter as string,
        performanceMonth: req.query.performanceMonth as string,
    };

    // Build a cache key that includes school and any active filters
    const filterSuffix = Object.values(filters).filter(Boolean).join(":");
    const cacheKey = `dashboard:school-admin:${user.schoolId}:${filterSuffix}`;

    /*
    const cached = cache.get<object>(cacheKey);
    if (cached) {
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
      return res.status(200).json(cached);
    }
    */

    console.log(`[DEBUG] Dashboard API: Fetching data for schoolId: ${user.schoolId}`);
    const data = await DashboardService.schoolAdmin.getDashboardData(user.schoolId, filters);
    console.log(`[DEBUG] Dashboard API: Data fetched. Student count: ${data?.keyMetrics?.totalStudents?.total}`);
    const response = { ...data, school: { id: user.schoolId } };

    // Cache for 60 seconds to reduce repeated expensive DB aggregations
    cache.set(cacheKey, response, 60);

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
    res.status(200).json(response);
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    if (error instanceof Error) {
        console.error(error.stack);
    }
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
