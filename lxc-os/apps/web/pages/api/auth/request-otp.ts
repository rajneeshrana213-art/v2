import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateOTP } from "@/lib/utils/common";
import { renderAndSendEmail } from "@/lib/utils/mailer";
import { sendSMS, sendEmail } from "@/lib/services/notification";
import Logger from "@/lib/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const requestId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
  try {
    const { email, phone } = req.body as { email?: string; phone?: string };
    
    if (!email && !phone) {
      res.status(400).json({ error: "Email or phone is required", requestId });
      return;
    }

    const user = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (!user) {
      res.status(404).json({ error: "User not found", requestId });
      return;
    }

    try {
      await prisma.otpToken.deleteMany({ where: { userId: user.id, used: false } });
      const otp = await generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.otpToken.create({
        data: {
          userId: user.id,
          otpHash,
          expiresAt,
        },
      });

      const message = `Your login OTP is ${otp}`;

      let smsSent = false;
      let emailSent = false;

      if (user.phone) {
        try {
          const ok = await sendSMS(user.phone, message);
          if (ok) smsSent = true;
        } catch (e) {
          Logger.error(`requestOtp sendSMS failed`, e);
        }
      }

      if (user.email) {
        // Send email via template
        try {
          const okTemplate = await renderAndSendEmail("send-otp", { otp, receiverName: user.name || '' }, "Your OTP Code", user.email);
          if (okTemplate) emailSent = true;
        } catch (e) {
          Logger.error(`requestOtp renderAndSendEmail threw`, e);
        }
      }

      if (!smsSent && !emailSent) {
        return res.status(500).json({ error: "Failed to send OTP", requestId });
      }

      return res.status(200).json({ success: "OTP sent", requestId });

    } catch (dbErr) {
      Logger.error(`requestOtp DB error`, dbErr);
      return res.status(500).json({ error: "Failed to create OTP token", requestId });
    }

  } catch (err) {
    Logger.error("requestOtp failed", err);
    return res.status(500).json({ error: "Failed to send OTP", requestId });
  }
}
