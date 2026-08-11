import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { MeetingService } from "@/lib/services/communication/meeting-service";

/**
 * POST /api/v1/communication/meetings/schedule
 * Body: { title, description?, startTime, durationMinutes?, participantIds[] }
 * Only Admin & Teacher can schedule meetings.
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
  const { title, description, startTime, durationMinutes, participantIds } =
    req.body;

  if (!title || !startTime || !Array.isArray(participantIds)) {
    return res
      .status(400)
      .json({ error: "title, startTime, and participantIds[] are required" });
  }

  try {
    const result = await MeetingService.scheduleMeeting(
      { id: user.id, role: user.role, schoolId: user.schoolId },
      {
        title,
        description,
        startTime: new Date(startTime),
        durationMinutes,
        participantIds,
      },
    );
    return res.status(201).json(result);
  } catch (error: any) {
    return res
      .status(error.message.includes("permission") ? 403 : 500)
      .json({ error: error.message });
  }
}
