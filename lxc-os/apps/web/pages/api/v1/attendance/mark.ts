
import { NextApiRequest, NextApiResponse } from "next";
import { AttendanceService } from "../../../../lib/services/attendance-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "../../../../lib/middleware/cors";


export const config = {
  api: {
    bodyParser: { sizeLimit: "8mb" },
    responseLimit: false,
  },
  // Allow up to 60s: 45s AI timeout + DB write + selfie upload overhead
  maxDuration: 60,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    const { selfieBase64, latitude, longitude } = req.body;

    if (!selfieBase64 || typeof selfieBase64 !== "string") {
      return res.status(400).json({ message: "selfieBase64 is required" });
    }
    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: "latitude and longitude are required" });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Invalid location coordinates" });
    }

    const result = await AttendanceService.markTeacherAttendance(user.id, {
      selfieBase64,
      latitude: lat,
      longitude: lng,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    const msg: string = error.message || "Attendance marking failed";

  
    const status =
      msg === "Attendance already marked for today" ? 409 :
        msg.startsWith("Too many failed attempts") ? 429 :
          msg.startsWith("Outside school premises") ? 403 :
            msg === "Face verification failed" || msg.startsWith("Face verification failed.") ? 401 :
              msg.startsWith("No face") || msg.includes("Invalid image") || msg.includes("Invalid or empty") || msg.includes("too large") ? 400 :
                msg.includes("timed out") ? 504 :
                  msg.includes("offline") ? 503 :
                    500;

    console.error(`[POST /attendance/mark] ${status} — ${msg}`);
    return res.status(status).json({ message: msg });
  }
}
