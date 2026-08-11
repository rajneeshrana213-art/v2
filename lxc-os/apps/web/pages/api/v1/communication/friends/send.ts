import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * POST  /api/v1/communication/friends/send
 * Body: { receiverId: string }
 * Only students can send friend requests to other-class students.
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

  const sender = (req as any).user;
  if (sender.role !== Role.student) {
    return res
      .status(403)
      .json({ error: "Only students can send friend requests" });
  }

  const { receiverId } = req.body;
  if (!receiverId)
    return res.status(400).json({ error: "receiverId is required" });
  if (receiverId === sender.id)
    return res.status(400).json({ error: "Cannot send request to yourself" });

  try {
    // Verify receiver is also a student
    const receiver = await prisma.user.findFirst({
      where: { id: receiverId, role: Role.student, isDeleted: false },
    });
    if (!receiver) return res.status(404).json({ error: "Student not found" });

    // Check if already friends
    const alreadyFriend = await prisma.friend.findFirst({
      where: {
        OR: [
          { user1Id: sender.id, user2Id: receiverId },
          { user1Id: receiverId, user2Id: sender.id },
        ],
      },
    });
    if (alreadyFriend)
      return res.status(409).json({ error: "Already friends" });

    // Check for existing pending request
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: sender.id, receiverId },
          { senderId: receiverId, receiverId: sender.id },
        ],
        status: "PENDING",
      },
    });
    if (existing)
      return res.status(409).json({ error: "Friend request already pending" });

    const request = await prisma.friendRequest.create({
      data: { senderId: sender.id, receiverId },
      include: {
        sender: { select: { id: true, name: true, profilePic: true } },
        receiver: { select: { id: true, name: true, profilePic: true } },
      },
    });

    return res.status(201).json({ request });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
