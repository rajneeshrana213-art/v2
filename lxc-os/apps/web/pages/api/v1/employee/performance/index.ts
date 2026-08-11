
import { NextApiRequest, NextApiResponse } from "next";
import { PerformanceService } from "../../../../../lib/services/performance-service";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      const { period } = req.query;
      
      // Get employee ID from user
      const employee = await prisma.employee.findFirst({
        where: { userId: user.id }
      });

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const performanceData = await PerformanceService.getPerformanceData(
        employee.id,
        period as string
      );

      return res.status(200).json(performanceData);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Performance API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

