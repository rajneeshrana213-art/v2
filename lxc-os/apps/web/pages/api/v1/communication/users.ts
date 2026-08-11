
import { NextApiRequest, NextApiResponse } from "next";
import { ChatService } from "../../../../lib/services/communication/chat-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    // Query params: schoolId, classId, role
    const { schoolId, classId, role } = req.query;
    
    const users = await ChatService.getUsers({
        schoolId: schoolId as string,
        classId: classId as string,
        role: role as string
    });
    
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch users" });
  }
}
