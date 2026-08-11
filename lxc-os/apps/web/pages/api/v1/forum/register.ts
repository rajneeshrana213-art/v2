import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cors } from "@/lib/middleware/cors";

// Public endpoint: intentionally accessible without session authentication.
// New forum members register here before they have an account. The route
// creates a user record with the forum_user role and enforces uniqueness of
// email at the database level.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      phone,
      password,
      educationLevel,
      subjectsExpertise,
      country,
      state,
      sex,
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, phone, and password are required" });
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || "",
        password: hashedPassword,
        role: "forum_user",
        address: "",
        city: "",
        state: state || "",
        country: country || "",
        pincode: "",
        bloodType: "",
        sex: (sex as any) || "OTHERS",
        forumUserProfile: {
          create: {
            educationLevel: educationLevel || null,
            subjectsExpertise: subjectsExpertise || null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        coins: true,
        reputation: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Forum user registered successfully",
      user,
    });
  } catch (error: any) {
    console.error("Forum registration error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
