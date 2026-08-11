
import { NextApiRequest, NextApiResponse } from "next";
import { DashboardService } from "../../../../../lib/services/dashboard";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "employee") {
    return res.status(403).json({ error: "Unauthorized. Employee access only." });
  }

  try {
    if (req.method === "GET") {
      console.log('Fetching all demos for user:', user.id);
      const data = await DashboardService.employee.getAllDemos(user.id);
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Employee Demos API Error:", error.stack || error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
