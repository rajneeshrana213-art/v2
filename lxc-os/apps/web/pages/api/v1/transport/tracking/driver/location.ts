import { NextApiRequest, NextApiResponse } from "next";
import { TripService } from "@/lib/services/trip-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
        const { tripId, latitude, longitude, speed, heading, timestamp } = req.body;
        
        if (!tripId || !latitude || !longitude) {
            return res.status(400).json({ error: "Missing required location data" });
        }

        // Cast timestamps if string
        const ts = timestamp ? new Date(timestamp) : new Date();

        await TripService.recordLocation(tripId, {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            speed: speed ? parseFloat(speed) : undefined,
            heading: heading ? parseFloat(heading) : undefined,
            timestamp: ts
        });

        return res.status(200).json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
