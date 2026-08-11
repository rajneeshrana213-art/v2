import { NextApiRequest, NextApiResponse } from "next";
import { getMaintenanceAlerts, generateMaintenanceAlerts } from "@/lib/services/transport/analytics-service";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  
  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    if (req.method === 'GET') {
      const { busId, isResolved } = req.query;
      
      // Optionally trigger generation before fetching to ensure fresh data
      await generateMaintenanceAlerts(user.schoolId);
      
      const alerts = await getMaintenanceAlerts(
        user.schoolId,
        busId as string,
        undefined,
        isResolved ? isResolved === 'true' : undefined
      );
      return res.status(200).json(alerts);
    }

    if (req.method === 'PATCH') {
      const { id, isAcknowledged, isResolved } = req.body;
      if (!id) return res.status(400).json({ error: "Alert ID required" });

      const updated = await prisma.busMaintenanceAlert.update({
        where: { id },
        data: { 
          isAcknowledged: isAcknowledged !== undefined ? isAcknowledged : undefined,
          isResolved: isResolved !== undefined ? isResolved : undefined,
          resolvedAt: isResolved ? new Date() : undefined
        }
      });
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("[MAINTENANCE_API_ERROR]", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
