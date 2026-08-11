import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username too long")
    .optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }

    const { name, userName } = parseResult.data;

    if (userName) {
      // Check if username is already taken
      const existing = await prisma.user.findFirst({
        where: {
          userName,
          id: { not: user.id },
        },
      });

      if (existing) {
        return res.status(400).json({ error: "Username already taken." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(userName && { userName }),
      },
    });

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        userName: updatedUser.userName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
