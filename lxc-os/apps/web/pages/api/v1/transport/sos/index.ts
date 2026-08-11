import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "@/lib/middleware/cors";
import { verifyAuth } from "@/lib/auth";
import { listActiveSOS, triggerSOS } from "@/lib/services/transport/sos-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;

  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  if (req.method === "POST") {
    try {
      const { tripId, latitude, longitude, reason } = req.body;
      const incident = await triggerSOS({
        tripId,
        driverId: user.id, // Current driver's ID
        schoolId: user.schoolId,
        latitude,
        longitude,
        reason,
      });
      return res.status(201).json(incident);
    } catch (error: any) {
        console.error("Trigger SOS error:", error);
        return res.status(500).json({ error: error.message || "Failed to trigger SOS" });
    }
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const incidents = await listActiveSOS(user.schoolId as string);
    return res.status(200).json(incidents);
  } catch (error: any) {
    console.error("List SOS error:", error);
    return res.status(500).json({ error: "Failed to load SOS incidents" });
  }
}


