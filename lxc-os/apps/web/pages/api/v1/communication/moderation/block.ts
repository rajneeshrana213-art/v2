import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { getStreamClient } from "@/lib/config/stream";

/**
 * POST   /api/v1/communication/moderation/block   — block a user
 * DELETE /api/v1/communication/moderation/block   — unblock a user
 * Body: { targetUserId: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const auth = await verifyAuth(req, res);
  if (!auth) return;

  const blocker = (req as any).user;
  const { targetUserId } = req.body ?? req.query;

  if (!targetUserId)
    return res.status(400).json({ error: "targetUserId is required" });
  if (targetUserId === blocker.id)
    return res.status(400).json({ error: "Cannot block yourself" });

  try {
    if (req.method === "POST") {
      // Block
      await prisma.block.upsert({
        where: {
          blockerId_blockedUserId: {
            blockerId: blocker.id,
            blockedUserId: targetUserId,
          },
        },
        create: { blockerId: blocker.id, blockedUserId: targetUserId },
        update: {},
      });

      // Shadow-mute on Stream Chat side (non-fatal)
      try {
        const streamClient = getStreamClient();
        await streamClient.muteUser(targetUserId, blocker.id);
      } catch (_) {}

      return res.status(200).json({ message: "User blocked" });
    }

    if (req.method === "DELETE") {
      await prisma.block.deleteMany({
        where: { blockerId: blocker.id, blockedUserId: targetUserId },
      });

      try {
        const streamClient = getStreamClient();
        await streamClient.unmuteUser(targetUserId, blocker.id);
      } catch (_) {}

      return res.status(200).json({ message: "User unblocked" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
