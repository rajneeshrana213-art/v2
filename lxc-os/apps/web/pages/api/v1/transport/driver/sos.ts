import { NextApiRequest, NextApiResponse } from "next";
import { triggerSOS } from "@/lib/services/transport/sos-service";
import { verifyAuth } from "@/lib/auth";
import * as fcmTriggers from "@/lib/services/notification/fcm-trigger-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { tripId, driverId, schoolId, latitude, longitude, reason } = req.body || {};

    if (!driverId || !schoolId) {
      return res.status(400).json({ error: "driverId and schoolId are required" });
    }

    const incident = await triggerSOS({
      tripId,
      driverId,
      schoolId,
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      reason,
    });

    // 🔔 Notify school admins immediately (fire-and-forget)
    fcmTriggers.notifySOS("Driver", "Route", reason || "Unknown", schoolId);

    return res.status(201).json(incident);
  } catch (error: any) {
    console.error("Driver SOS error:", error);
    return res.status(500).json({ error: error.message || "Failed to trigger SOS" });
  }
}


