/**
 * POST /api/v1/notification/register-token
 *
 * Called from mobile app after login to store the FCM device token.
 * Authenticated. Upserts token, deactivates old tokens for same device.
 *
 * Body: { token: string, deviceInfo?: "android" | "ios" }
 */

import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { upsertToken } from "@/lib/services/notification/fcm-service";
import Logger from "@/lib/utils/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authUser = await verifyAuth(req, res);
  if (!authUser) return; // verifyAuth sends 401 itself

  const { token, deviceInfo } = req.body as { token?: string; deviceInfo?: string };

  if (!token || typeof token !== "string" || token.length < 10) {
    return res.status(400).json({ error: "Valid FCM token is required." });
  }
  if (!authUser.schoolId) {
    return res.status(400).json({ error: "User must be associated with a school." });
  }

  try {
    await upsertToken({
      userId:     authUser.id,
      userType:   authUser.role,
      token,
      deviceInfo: deviceInfo ?? "android",
      schoolId:   authUser.schoolId,
    });

    Logger.info("[FCM] Token registered", { userId: authUser.id, role: authUser.role });
    return res.status(200).json({ success: true, message: "Token registered successfully." });
  } catch (err: any) {
    Logger.error("[FCM] register-token error", { err: err.message });
    return res.status(500).json({ error: "Failed to register token. Please try again." });
  }
}
