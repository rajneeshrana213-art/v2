import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { renderAndSendEmail } from "@/lib/utils/mailer";
import { CONFIG } from "@/lib/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user || user.role !== Role.superadmin) {
    if (!res.writableEnded) res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const adminEmail = "contactlearnxchain@gmail.com";
  const sender =
    CONFIG.EMAIL_AUTH_USERNAME ||
    process.env.EMAIL_AUTH_USERNAME ||
    process.env.EMAIL_SERVER_USER ||
    "";

  try {
    console.log(
      `🧪 [TestEmail] Attempting to send test email to ${adminEmail}...`,
    );

    // Since mailer uses EJS wrappers natively, map out the context data
    await renderAndSendEmail(
      "test-email",
      { timestamp: new Date().toLocaleString() },
      "🧪 LearnXChain Email System Test",
      adminEmail,
    );

    return res.status(200).json({
      message:
        "Test email sent successfully! Please check your inbox (including spam).",
      status: "success",
      details: {
        to: adminEmail,
        from: sender,
      },
    });
  } catch (err: any) {
    console.error("❌ [TestEmail] Failed to send test email:", err);
    return res.status(500).json({
      message: "Failed to send test email",
      error: err.message,
      status: "error",
    });
  }
}
