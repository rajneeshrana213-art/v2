/**
 * POST /api/v1/notification/send-bulk
 *
 * Send a push to all users of a given role in the school, or to the entire school.
 * Admin only.
 *
 * Body: {
 *   role?: "student" | "teacher" | "parent" | "admin" | "all",
 *   title: string,
 *   body: string,
 *   data?: Record<string,string>,
 *   screen?: string,
 * }
 */

import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { sendToRole, logPush } from "@/lib/services/notification/fcm-service";
import Logger from "@/lib/utils/logger";

const ALLOWED_ROLES = ["admin", "superadmin"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authUser = await verifyAuth(req, res);
  if (!authUser) return;
  if (!ALLOWED_ROLES.includes(authUser.role)) {
    return res.status(403).json({ error: "Forbidden: admin access required." });
  }

  const { role = "all", title, body, data, screen } = req.body as {
    role?:   string;
    title:   string;
    body:    string;
    data?:   Record<string, string>;
    screen?: string;
  };

  if (!title || !body) return res.status(400).json({ error: "title and body are required." });
  if (!authUser.schoolId) return res.status(400).json({ error: "Sender must belong to a school." });

  const payload = { title, body, data: { ...(data ?? {}), ...(screen ? { screen } : {}) } };
  const roles = role === "all" ? ["student", "teacher", "parent", "admin"] : [role];

  try {
    let totalSuccess = 0;
    let totalFailure = 0;

    for (const r of roles) {
      const result = await sendToRole(authUser.schoolId, r, payload, {
        trigger: undefined,
        sentBy:  authUser.id,
      });
      totalSuccess += result.successCount;
      totalFailure += result.failureCount;
    }

    return res.status(200).json({ success: true, successCount: totalSuccess, failureCount: totalFailure });
  } catch (err: any) {
    Logger.error("[FCM] send-bulk error", { err: err.message });
    return res.status(500).json({ error: "Failed to send bulk notification." });
  }
}
