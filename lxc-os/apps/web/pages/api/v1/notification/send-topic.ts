/**
 * POST /api/v1/notification/send-topic
 *
 * Send to a FCM topic. Use for class-wise or school-wide pushes.
 * Admin only.
 *
 * Recommended topic naming convention:
 *   school-{schoolId}           → all devices in a school
 *   class-{classId}             → all students in a class
 *   role-{schoolId}-{role}      → all users of a role
 *
 * Body: { topic: string, title: string, body: string, data?: Record<string,string> }
 *
 * NOTE: Devices must have subscribed to the topic via expo-notifications
 *       or the FCM subscribeToTopic API for this to work.
 */

import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { sendToTopic, logPush } from "@/lib/services/notification/fcm-service";
import Logger from "@/lib/utils/logger";

const ALLOWED_ROLES = ["admin", "superadmin"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authUser = await verifyAuth(req, res);
  if (!authUser) return;
  if (!ALLOWED_ROLES.includes(authUser.role)) {
    return res.status(403).json({ error: "Forbidden: admin access required." });
  }

  const { topic, title, body, data } = req.body as {
    topic:  string;
    title:  string;
    body:   string;
    data?:  Record<string, string>;
  };

  if (!topic || !title || !body) {
    return res.status(400).json({ error: "topic, title, and body are required." });
  }
  // Basic topic format validation (FCM topic names: letters, digits, hyphens, underscores, dots)
  if (!/^[a-zA-Z0-9\-_.~%]+$/.test(topic)) {
    return res.status(400).json({ error: "Invalid topic format." });
  }
  if (!authUser.schoolId) return res.status(400).json({ error: "Sender must belong to a school." });

  try {
    const result = await sendToTopic(topic, { title, body, data });

    await logPush({
      schoolId:     authUser.schoolId,
      payload:      { title, body, data },
      targetType:   "topic",
      target:       topic,
      successCount: result.success ? 1 : 0,
      failureCount: result.success ? 0 : 1,
      sentBy:       authUser.id,
      trigger:      undefined,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error ?? "FCM topic send failed." });
    }
    return res.status(200).json({ success: true, topic });
  } catch (err: any) {
    Logger.error("[FCM] send-topic error", { err: err.message });
    return res.status(500).json({ error: "Failed to send topic notification." });
  }
}
