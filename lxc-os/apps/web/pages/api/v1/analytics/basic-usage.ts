import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getBasicUsageAnalytics } from "@/lib/services/analytics/basic-analytics-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (req.method === "GET") {
      const data = await getBasicUsageAnalytics({
        role: req.query.role as string | undefined,
        classId: req.query.classId as string | undefined,
        branchId: req.query.branchId as string | undefined,
      });
      return res.status(200).json(data);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
