import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getUsageAnalytics, logUsage } from "@/lib/services/analytics/usage-analytics-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (req.method === "POST") {
      const userId = user.id;
      const role = user.role;
      const schoolId = (user.schoolId) || req.body.schoolId;
      const { module, deviceType, duration, lat, lng } = req.body;
      
      await logUsage({ userId, role, schoolId, module, deviceType, duration, lat, lng });
      return res.status(200).json({ success: true });
    }

    if (req.method === "GET") {
      let schoolId = req.query.schoolId as string | undefined;
      // If not superadmin, restrict to own school
      if (user.role !== "superadmin") {
        schoolId = user.schoolId;
      }

      const data = await getUsageAnalytics({
        role: req.query.role as string | undefined,
        module: req.query.module as string | undefined,
        device: req.query.device as string | undefined,
        range: req.query.range as string | undefined,
        schoolId,
        latlng: req.query.latlng as string | undefined,
      });
      return res.status(200).json(data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
