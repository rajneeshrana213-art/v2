import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { sendErrorToAdmin } from "@/lib/utils/error-notifier";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyAuth(req, res);
  if (!user || user.role !== Role.superadmin) {
    if (!res.writableEnded) res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const error = new Error("Verification Error: Test error triggered via API with fixed config");
    await sendErrorToAdmin(error, { 
      source: "Manual Verification Fix",
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ 
      message: "Test error triggered and sendErrorToAdmin called. Check email/logs.",
      status: "success"
    });
  } catch (err: any) {
    return res.status(500).json({ 
      message: "Failed to trigger/send error",
      error: err.message
    });
  }
}
