
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { ChatService } from "@/lib/services/communication/chat-service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const user = (req as any).user;
    const { channelId, memberIds, action } = req.body; // action: 'add' | 'remove'
    
    // Legacy route split support: determine action from URL or body? 
    // Let's assume body for now or make separate files if needed. 
    // Task used 'add-members' and 'remove-members'. New API: single endpoint or separate?
    // Let's make separate to match legacy exactly if possible, or consolidated.
    // Consolidated is better REST: PUT /members vs DELETE /members.
    // But for now, let's just implement 'manage' endpoint handled by body 'action'.
    
    if (!action || !['add', 'remove'].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
    }

    const result = await ChatService.manageMembers(user, action, channelId, memberIds);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to manage members" });
  }
}
