import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { getStreamClient } from "@/lib/config/stream";

/**
 * POST /api/v1/communication/friends/respond
 * Body: { requestId: string, action: "accept" | "decline" }
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
  const { requestId, action } = req.body;

  if (!requestId || !["accept", "decline"].includes(action)) {
    return res
      .status(400)
      .json({ error: "requestId and action (accept|decline) are required" });
  }

  try {
    const request = await prisma.friendRequest.findFirst({
      where: { id: requestId, receiverId: user.id, status: "PENDING" },
    });
    if (!request)
      return res
        .status(404)
        .json({ error: "Request not found or already handled" });

    if (action === "accept") {
      await prisma.$transaction([
        prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: "ACCEPTED" },
        }),
        prisma.friend.create({
          data: { user1Id: request.senderId, user2Id: request.receiverId },
        }),
      ]);

      // Create a Stream Channel so they can chat immediately
      try {
        const streamClient = getStreamClient();
        const channelId = [request.senderId, request.receiverId]
          .sort()
          .join("_");
        const channel = streamClient.channel("messaging", channelId, {
          members: [request.senderId, request.receiverId],
          created_by_id: user.id,
        });
        await channel.create();
      } catch (_) {
        // Non-fatal – channel may already exist
      }

      return res.status(200).json({ message: "Friend request accepted" });
    } else {
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "DECLINED" },
      });
      return res.status(200).json({ message: "Friend request declined" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
