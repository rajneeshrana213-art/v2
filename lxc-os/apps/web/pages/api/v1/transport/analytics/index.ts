import { NextApiRequest, NextApiResponse } from "next";
import { generateTransportAnalytics, getTransportAnalytics } from "@/lib/services/transport/analytics-service";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  
  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    if (req.method === 'GET') {
      const { periodType, refresh } = req.query;
      
      if (refresh === 'true') {
        const start = new Date();
        start.setDate(start.getDate() - 30); // Default last 30 days for refresh
        await generateTransportAnalytics(user.schoolId, start, new Date(), (periodType as any) || 'daily');
      }

      const analytics = await getTransportAnalytics(user.schoolId, periodType as any);
      return res.status(200).json(analytics);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("[ANALYTICS_API_ERROR]", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
