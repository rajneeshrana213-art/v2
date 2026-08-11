import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signInSchema } from "@/lib/validations/auth";
import { generateJwtToken } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await cors(req, res);

  if (req.method === "OPTIONS") {
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parseResult = signInSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { userName: email }],
      },
      include: { school: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.password) {
      return res.status(500).json({ error: "User password is missing." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT access token (long expiry for mobile)
    const accessToken = await generateJwtToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.school?.id || user?.schoolId || null,
      },
      "7d",
      false
    );

    res.status(200).json({
      success: "ok",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId || user.school?.id || null,
      },
    });
  } catch (error: any) {
    console.error("Error signing in (mobile):", error);
    res.status(500).json({ 
      error: process.env.NODE_ENV === "development" 
        ? `Server Error: ${error.message}` 
        : "Something went wrong. Please try again." 
    });
  }
}
