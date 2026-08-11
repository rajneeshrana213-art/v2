import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

/**
 * GET  /api/v1/communication/friends/list
 * Returns friends + pending requests for the authenticated user.
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
    const [friends, sentRequests, receivedRequests] = await Promise.all([
      prisma.friend.findMany({
        where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
        include: {
          user1: {
            select: { id: true, name: true, profilePic: true, role: true },
          },
          user2: {
            select: { id: true, name: true, profilePic: true, role: true },
          },
        },
      }),
      prisma.friendRequest.findMany({
        where: { senderId: user.id, status: "PENDING" },
        include: {
          receiver: { select: { id: true, name: true, profilePic: true } },
        },
      }),
      prisma.friendRequest.findMany({
        where: { receiverId: user.id, status: "PENDING" },
        include: {
          sender: { select: { id: true, name: true, profilePic: true } },
        },
      }),
    ]);

    // Flatten friends list to just the "other" user
    const friendList = friends.map((f) => ({
      friendRequestId: f.id,
      since: f.createdAt,
      user: f.user1Id === user.id ? f.user2 : f.user1,
    }));

    return res
      .status(200)
      .json({ friends: friendList, sentRequests, receivedRequests });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
