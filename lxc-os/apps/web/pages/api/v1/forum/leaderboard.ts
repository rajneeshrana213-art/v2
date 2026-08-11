import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { limit } = req.query;
    const take = Math.min(50, parseInt(limit as string) || 20);

    const topContributors = await prisma.user.findMany({
      where: {
        OR: [
          { role: "forum_user" },
          { role: "teacher" },
          { role: "student" },
        ],
        coins: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        profilePic: true,
        role: true,
        coins: true,
        reputation: true,
      },
      orderBy: [{ coins: "desc" }, { reputation: "desc" }],
      take,
    });

    return res.status(200).json(topContributors);
  } catch (error: any) {
    console.error("Forum leaderboard error:", error);
    return res.status(500).json({ error: error.message });
  }
}
