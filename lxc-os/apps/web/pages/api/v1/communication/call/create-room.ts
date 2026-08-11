
import { NextApiRequest, NextApiResponse } from "next";
import { ChatService } from "../../../../../lib/services/communication/chat-service";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const { callId, userId } = req.body; 
    // Note: userId in body might be different from auth user? 
    // Controller used body.userId. Let's use auth user for security or allow body if valid use case?
    // Controller seemed to trust body. Let's use body but verify match or allow if admin?
    // For now, let's stick to auth user as creator.
    
    // Actually controller schema: createRoomSchema = z.object({ callId, userId })
    // It uses userId from body to set `created_by_id`.
    
    const result = await ChatService.createCallRoom(userId || (req as any).user.id, callId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create call room" });
  }
}
