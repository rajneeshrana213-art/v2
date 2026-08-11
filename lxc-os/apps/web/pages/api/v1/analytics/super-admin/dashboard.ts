import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getComprehensiveSuperAdminAnalytics } from "@/lib/services/analytics/super-admin-analytics-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    // Strict check for superadmin
    if (user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden: Superadmin access required" });
    }

    if (req.method === "GET") {
      const { range, schoolId, startDate, endDate } = req.query;

      const analytics = await getComprehensiveSuperAdminAnalytics({
        range: range as string | undefined,
        schoolId: schoolId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });

      return res.status(200).json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
