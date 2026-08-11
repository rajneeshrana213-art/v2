import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/v1/forum/profile/update-goal
 *
 * Authenticated endpoint for forum_users to update their education goal
 * (school | college | competitive). The goal determines which premium plan
 * module is unlocked for purchase. Other modules remain locked until the
 * user changes their goal preference.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "forum_user") {
    return res.status(403).json({ error: "Only forum users can update their goal." });
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { educationLevel } = req.body;

  const VALID_GOALS = ["school", "college", "competitive"] as const;
  type EducationLevel = typeof VALID_GOALS[number];

  if (!educationLevel || !VALID_GOALS.includes(educationLevel as EducationLevel)) {
    return res.status(400).json({
      error: `Invalid educationLevel. Must be one of: ${VALID_GOALS.join(", ")}.`,
    });
  }

  try {
    // Upsert the ForumUserProfile — create if missing, update if exists
    const updated = await prisma.forumUserProfile.upsert({
      where: { userId: user.id },
      update: { educationLevel: educationLevel as string },
      create: {
        userId: user.id,
        educationLevel: educationLevel as string,
      },
      select: {
        id: true,
        userId: true,
        educationLevel: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Learning goal updated successfully.",
      educationLevel: updated.educationLevel,
    });
  } catch (error: any) {
    console.error("update-goal error:", error);
    return res.status(500).json({ error: error.message || "Internal server error." });
  }
}
