import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { MeetingService } from "@/lib/services/communication/meeting-service";

/**
 * POST /api/v1/communication/meetings/end
 * Body: { callId: string }
 * Only the meeting creator can end it.
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
  const { callId } = req.body;
  if (!callId) return res.status(400).json({ error: "callId is required" });

  try {
    await MeetingService.endMeeting(callId, user.id);
    return res.status(200).json({ message: "Meeting ended" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
