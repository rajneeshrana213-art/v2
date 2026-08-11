
import { NextApiRequest, NextApiResponse } from "next";
// import { DashboardService } from "../../../../../../lib/services/dashboard";
// import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";
import { DashboardService } from "@/lib/services/dashboard";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  try {
    if (req.method === "PATCH") {
      const { status, notes } = req.body;
      if (!status) return res.status(400).json({ error: "Missing status" });

      const demo = await DashboardService.employee.updateDemoStatus(id as string, status, notes);
      return res.status(200).json(demo);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Update Demo Status API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
