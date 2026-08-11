import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "forum_user") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const profile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          profilePic: true,
          coins: true,
          reputation: true,
          createdAt: true,
          forumUserProfile: true,
          doubtReplies: {
            select: {
              id: true,
              content: true,
              upvotes: true,
              isAccepted: true,
              createdAt: true,
              doubt: {
                select: {
                  id: true,
                  title: true,
                  subject: { select: { name: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          coinTransactions: {
            select: { id: true, coins: true, reason: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      return res.status(200).json(profile);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
