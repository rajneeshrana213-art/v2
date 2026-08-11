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

  const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:5002";
  const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 15_000;

  // 1x1 transparent PNG base64 representation
  const testPixelBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  const start = performance.now();
  try {
    const response = await axios.post(
      `${FACE_SERVICE_URL}/embedding`,
      { imageUrl: testPixelBase64 },
      { timeout: AI_TIMEOUT_MS }
    );

    const latencyMs = Math.round(performance.now() - start);
    return res.status(200).json({
      success: true,
      status: "embedding_extracted",
      message: "Successfully generated face embedding from test payload.",
      latencyMs,
      embedding: response.data?.embedding || ""
    });
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);

    // If the service responded with 400 "No face detected", the service is operational!
    if (err.response && err.response.status === 400) {
      return res.status(200).json({
        success: true,
        status: "no_face_detected",
        message: "Service responded successfully. Connection verified. (No face detected in test pixel, as expected).",
        latencyMs,
        details: err.response.data
      });
    }

    // Otherwise, it is a genuine connection error or crash
    const details = err.response?.data?.detail || err.message || "Unknown error";
    return res.status(500).json({
      success: false,
      status: "offline",
      message: "Could not connect to the face recognition service.",
      latencyMs,
      details
    });
  }
}
