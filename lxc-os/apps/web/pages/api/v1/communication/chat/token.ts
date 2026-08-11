
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { ChatService } from "@/lib/services/communication/chat-service";
import { NextApiRequest, NextApiResponse } from "next";
// import { ChatService } from "../../../../lib/services/communication/chat-service";
// import { verifyAuth } from "../../../../lib/auth";
// import { cors } from "../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const user = (req as any).user;
    const result = await ChatService.getToken(user.id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate token" });
  }
}
