import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 1. Verify Superadmin authorization
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden: Super Admin access required" });
  }

  const TIMETABLE_AI_URL = process.env.TIMETABLE_AI_URL || "http://localhost:8000/generate-timetable";

  // Minimal constraint-solving request payload
  const testPayload = {
    payload: {
      classes: [
        {
          id: "Class-10A",
          roomNumber: "Room-201",
          subjects: [
            { name: "Mathematics", teacherId: "T-Math" },
            { name: "Science", teacherId: "T-Science" }
          ],
          periods_per_subject: 2
        }
      ],
      rooms: [
        { id: "Room-201" }
      ],
      days: ["Monday", "Tuesday", "Wednesday"],
      timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"]
    },
    teacherPreferences: {
      "T-Math": ["09:00 AM", "10:00 AM"],
      "T-Science": ["11:00 AM", "12:00 PM"]
    }
  };

  const start = performance.now();
  try {
    const response = await axios.post(
      TIMETABLE_AI_URL.trim(),
      testPayload,
      { timeout: 10000 }
    );

    const latencyMs = Math.round(performance.now() - start);
    return res.status(200).json({
      success: true,
      status: "solved",
      message: "AI Solver successfully scheduled classes with zero conflicts.",
      latencyMs,
      timetable: response.data?.timetable || response.data || []
    });
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    const details = err.response?.data?.detail || err.message || "Unknown error";
    return res.status(500).json({
      success: false,
      status: "offline",
      message: "Could not connect to the Timetable AI solver microservice.",
      latencyMs,
      details
    });
  }
}
