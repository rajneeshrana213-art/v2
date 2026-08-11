import { NextApiRequest, NextApiResponse } from "next";
import { TripService } from "@/lib/services/trip-service";
import { cors } from "@/lib/middleware/cors";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res);
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const authResult = await verifyAuth(req, res);
        if (!authResult) return;

        const { tripId, latitude, longitude, speed, heading } = req.body;
        
        if (!tripId) return res.status(400).json({ error: "tripId is required" });

        const location = await TripService.recordLocation(tripId, {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            speed: speed ? parseFloat(speed) : undefined,
            heading: heading ? parseFloat(heading) : undefined
        });

        return res.status(200).json(location);
    } catch (error: any) {
        console.error("[TRIP_LOCATION_REPORT_ERROR]", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}
