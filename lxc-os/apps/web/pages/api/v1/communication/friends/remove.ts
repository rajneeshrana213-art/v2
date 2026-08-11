import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/v1/communication/friends/remove
 * Body: { friendId: string }    (the other user's id)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);
  if (req.method !== "DELETE")
    return res.status(405).json({ error: "Method not allowed" });

  const auth = await verifyAuth(req, res);
  if (!auth) return;

  const user = (req as any).user;
  const { friendId } = req.body;
  if (!friendId) return res.status(400).json({ error: "friendId is required" });

  try {
    const record = await prisma.friend.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: friendId },
          { user1Id: friendId, user2Id: user.id },
        ],
      },
    });
    if (!record) return res.status(404).json({ error: "Friendship not found" });

    await prisma.friend.delete({ where: { id: record.id } });
    return res.status(200).json({ message: "Friend removed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
