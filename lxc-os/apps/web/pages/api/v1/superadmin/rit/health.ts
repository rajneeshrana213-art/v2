import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 1. Verify Superadmin authorization
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden: Super Admin access required" });
  }

  const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:5002";
  const TIMETABLE_AI_URL = process.env.TIMETABLE_AI_URL || "http://localhost:8000/generate-timetable";
  
  // Extract base host for Timetable solver health check
  let timetableHealthUrl = "http://localhost:8000/health";
  try {
    const url = new URL(TIMETABLE_AI_URL.trim());
    timetableHealthUrl = `${url.protocol}//${url.host}/health`;
  } catch (e) {
    // Fallback if URL parsing fails
  }

  const RIT_CLASSROOM_URL = process.env.NEXT_PUBLIC_RIT_CLASSROOM_URL || "http://localhost:5000";

  // 2. Perform concurrent health checks
  const [faceCheck, timetableCheck, classroomCheck] = await Promise.all([
    // Face Recognition Health
    (async () => {
      const start = performance.now();
      try {
        const response = await axios.get(`${FACE_SERVICE_URL}/health`, { timeout: 3000 });
        return {
          status: "operational",
          latencyMs: Math.round(performance.now() - start),
          details: response.data || "Healthy",
          url: FACE_SERVICE_URL
        };
      } catch (err: any) {
        return {
          status: "offline",
          latencyMs: 0,
          details: err.message || "Connection refused",
          url: FACE_SERVICE_URL
        };
      }
    })(),

    // Timetable Solver Health
    (async () => {
      const start = performance.now();
      try {
        const response = await axios.get(timetableHealthUrl, { timeout: 3000 });
        return {
          status: "operational",
          latencyMs: Math.round(performance.now() - start),
          details: response.data || "Healthy",
          url: timetableHealthUrl
        };
      } catch (err: any) {
        return {
          status: "offline",
          latencyMs: 0,
          details: err.message || "Connection refused",
          url: timetableHealthUrl
        };
      }
    })(),

    // RIT AI Classroom Health
    (async () => {
      const start = performance.now();
      try {
        // Next.js app homepage is checked for status code
        const response = await axios.get(RIT_CLASSROOM_URL, { timeout: 3000 });
        return {
          status: response.status >= 200 && response.status < 400 ? "operational" : "degraded",
          latencyMs: Math.round(performance.now() - start),
          details: `HTTP Status ${response.status}`,
          url: RIT_CLASSROOM_URL
        };
      } catch (err: any) {
        // If it returns a status but it's an error, it is still reachable
        if (err.response) {
          return {
            status: "operational",
            latencyMs: Math.round(performance.now() - start),
            details: `HTTP Status ${err.response.status}`,
            url: RIT_CLASSROOM_URL
          };
        }
        return {
          status: "offline",
          latencyMs: 0,
          details: err.message || "Connection refused",
          url: RIT_CLASSROOM_URL
        };
      }
    })()
  ]);

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    services: {
      faceService: faceCheck,
      timetableService: timetableCheck,
      classroomService: classroomCheck
    }
  });
}
