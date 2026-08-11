/**
 * POST /api/v1/notification/send
 *
 * Send a push notification to a single user by userId.
 * Admin and Teacher only.
 *
 * Body: { userId: string, title: string, body: string, data?: Record<string,string>, screen?: string }
 */

import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { sendToUser, logPush } from "@/lib/services/notification/fcm-service";
import Logger from "@/lib/utils/logger";

const ALLOWED_ROLES = ["admin", "teacher", "superadmin"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authUser = await verifyAuth(req, res);
  if (!authUser) return;
  if (!ALLOWED_ROLES.includes(authUser.role)) {
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  }

  const { userId, title, body, data, screen } = req.body as {
    userId: string;
    title:  string;
    body:   string;
    data?:  Record<string, string>;
    screen?: string;
  };

  if (!userId || !title || !body) {
    return res.status(400).json({ error: "userId, title, and body are required." });
  }
  if (!authUser.schoolId) {
    return res.status(400).json({ error: "Sender must be associated with a school." });
  }

  try {
    const result = await sendToUser(userId, {
      title,
      body,
      data: { ...(data ?? {}), ...(screen ? { screen } : {}) },
    });

    await logPush({
      schoolId:     authUser.schoolId,
      payload:      { title, body, data },
      targetType:   "single",
      target:       userId,
      successCount: result.successCount,
      failureCount: result.failureCount,
      sentBy:       authUser.id,
      trigger:      undefined,
    });

    return res.status(200).json({
      success: true,
      successCount: result.successCount,
      failureCount: result.failureCount,
    });
  } catch (err: any) {
    Logger.error("[FCM] send error", { err: err.message });
    return res.status(500).json({ error: "Failed to send notification." });
  }
}
