import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateJwtToken } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import Logger from "@/lib/utils/logger";
import { serialize } from "cookie";
import { syncStreamUser } from "@/lib/services/stream-sync";
import { rateLimit } from "@/lib/middleware/rate-limit";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Strict rate limit: 10 attempts per 15 minutes to prevent OTP brute force
  if (!rateLimit(req, res, { limit: 10, windowSeconds: 15 * 60 })) return;

  try {
    const { email, phone, otp } = req.body as { email?: string; phone?: string; otp: string };
    
    if (!otp || (!email && !phone)) {
      return res.status(400).json({ error: "Email/phone and OTP are required" });
    }

    const user = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] }, include: { school: true } });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const record = await prisma.otpToken.findFirst({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ error: "OTP expired or invalid" });
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await prisma.otpToken.update({ where: { id: record.id }, data: { used: true } });

    // Generate Tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.school?.id || user.schoolId || null,
    };

    const accessToken = await generateJwtToken(
      tokenPayload,
      CONFIG.JWT_LOGIN_TOKEN_EXPIRY_TIME,
      false
    );

    const refreshToken = await generateJwtToken(
      tokenPayload,
      CONFIG.JWT_REFRESH_TOKEN_EXPIRY_TIME,
      true
    );

    // Set Cookie
    const cookie = serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "strict",
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);

    // Sync Stream (non-blocking)
    syncStreamUser(user.id).catch((err) => {
      console.error("[VerifyOTP] Stream sync failed:", err);
    });

    return res.status(200).json({
      success: "ok",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId || user.school?.id || null,
      },
    });

  } catch (err) {
    Logger.error("verifyOtp failed", err);
    return res.status(500).json({ error: "Login failed" });
  }
}
