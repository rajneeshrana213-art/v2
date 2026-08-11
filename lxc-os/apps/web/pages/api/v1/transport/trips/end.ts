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
    const { tripId } = req.body || {};

    if (!tripId || typeof tripId !== "string") {
      return res.status(400).json({ error: "tripId is required" });
    }

    const trip = await TripService.endTrip(tripId);

    // 🔔 Notify parents that the bus route has completed (fire-and-forget)
    if (trip.routeId) {
      fcmTriggers.notifyBusStopped(trip.routeId, trip.schoolId);
    }

    return res.status(200).json(trip);
  } catch (error: any) {
    console.error("End trip error:", error);
    return res.status(500).json({ error: error.message || "Failed to end trip" });
  }
}


