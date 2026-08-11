import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { MeetingService } from "@/lib/services/communication/meeting-service";

/**
 * POST /api/v1/communication/meetings/instant
 * Body: { title?: string }
 * Admin & Teacher only — starts a meeting room immediately.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const auth = await verifyAuth(req, res);
  if (!auth) return;

  const user = (req as any).user;
  const title =
    req.body?.title || `Instant Meeting - ${new Date().toLocaleString()}`;

  try {
    const result = await MeetingService.startInstantMeeting(
      { id: user.id, role: user.role, schoolId: user.schoolId },
      title,
    );
    return res.status(201).json(result);
  } catch (error: any) {
    return res
      .status(error.message.includes("permission") ? 403 : 500)
      .json({ error: error.message });
  }
}
