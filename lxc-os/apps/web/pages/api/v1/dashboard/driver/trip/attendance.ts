import { NextApiRequest, NextApiResponse } from "next";
import { DriverService } from "@/lib/services/dashboard/driver-service";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    const { tripId, studentId, status } = req.body;
    if (!tripId || !studentId || !status) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const attendance = await DriverService.updateStudentStatus(tripId, studentId, status);
    res.status(200).json(attendance);
  } catch (error: any) {
    console.error("[DRIVER_ATTENDANCE_ERROR]", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
