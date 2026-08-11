
import { NextApiRequest, NextApiResponse } from "next";
import { DashboardService } from "../../../../lib/services/dashboard";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const user = (req as any).user;

    const data = await DashboardService.parent.getDashboardData(user.id);
    res.status(200).json(data);
  } catch (error: any) {
    const status = error.message === "Parent not found" ? 404 : 500;
    res.status(status).json({ error: error.message || "Internal server error" });
  }
}
