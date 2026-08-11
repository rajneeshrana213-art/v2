import { NextApiRequest, NextApiResponse } from "next";
import { TripService } from "@/lib/services/trip-service";
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
    const { driverId, routeId, busId, schoolId, busStopIds } = req.body || {};

    if (!driverId || !busId || !schoolId) {
      return res.status(400).json({ error: "driverId, busId and schoolId are required" });
    }

    const trip = await TripService.startTrip({
      driverId,
      routeId,
      busId,
      schoolId,
      busStopIds,
    });

    // 🔔 Notify parents of students on this route (fire-and-forget)
    if (routeId) {
      fcmTriggers.notifyBusStarted(routeId, "the driver", schoolId);
    }

    return res.status(201).json(trip);
  } catch (error: any) {
    console.error("Start trip error:", error);
    return res.status(500).json({ error: error.message || "Failed to start trip" });
  }
}


