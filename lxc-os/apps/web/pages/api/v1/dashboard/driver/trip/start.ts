
import { NextApiRequest, NextApiResponse } from "next";
import { DriverService } from "../../../../../../lib/services/dashboard/driver-service";
import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "../../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { routeId, type } = req.body;
  if (!routeId || !type) return res.status(400).json({ error: "routeId and type are required" });

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    const trip = await DriverService.startTrip(user.id, routeId, type);
    res.status(200).json(trip);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
