import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
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
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // 1. Check if user exists in the database
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { userName: email }],
      },
      include: { school: true },
    });

    // 2. If user does not exist, auto-register as forum_user
    if (!user) {
      const displayName = name || email.split("@")[0] || "Google User";
      user = await prisma.user.create({
        data: {
          name: displayName,
          email,
          phone: "",
          password: "", // OAuth/Google users don't have a local password hash
          role: "forum_user",
          address: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
          bloodType: "",
          sex: "OTHERS",
          forumUserProfile: {
            create: {
              educationLevel: null,
              subjectsExpertise: null,
            },
          },
        },
        include: { school: true },
      });
    }

    // 3. Generate JWT access token for mobile (long expiry: 7 days)
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
    console.error("Error signing in with Google (mobile):", error);
    res.status(500).json({ 
      error: process.env.NODE_ENV === "development" 
        ? `Server Error: ${error.message}` 
        : "Something went wrong. Please try again." 
    });
  }
}
