import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/v1/communication/moderation/blocked
 * Returns all users blocked by the authenticated user.
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
    const blocks = await prisma.block.findMany({
      where: { blockerId: user.id },
      include: {
        blockedUser: {
          select: { id: true, name: true, profilePic: true, role: true },
        },
      },
    });
    return res
      .status(200)
      .json({
        blockedUsers: blocks.map((b) => ({
          ...b.blockedUser,
          blockedAt: b.createdAt,
        })),
      });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
