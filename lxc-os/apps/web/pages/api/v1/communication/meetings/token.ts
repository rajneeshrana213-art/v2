import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { MeetingService } from "@/lib/services/communication/meeting-service";

/**
 * GET  /api/v1/communication/meetings/token
 * Returns a Stream Video user token for the authenticated user.
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

  try {
    const { token } = await MeetingService.getVideoToken(user.id);
    return res
      .status(200)
      .json({ token, userId: user.id, apiKey: process.env.STREAM_API_KEY });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
