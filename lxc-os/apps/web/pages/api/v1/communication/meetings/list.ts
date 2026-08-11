import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { MeetingService } from "@/lib/services/communication/meeting-service";

/**
 * GET /api/v1/communication/meetings/list?filter=upcoming|past
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const auth = await verifyAuth(req, res);
  if (!auth) return;

  const user = (req as any).user;
  const filter = req.query.filter as "upcoming" | "past" | undefined;

  try {
    const meetings = await MeetingService.listMeetings(user.id, filter);
    return res.status(200).json({ meetings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
