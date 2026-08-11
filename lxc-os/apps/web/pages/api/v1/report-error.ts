import { NextApiRequest, NextApiResponse } from "next";
import { sendErrorToAdmin } from "@/lib/utils/error-notifier";
import { cors } from "@/lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { message, stack, component, url, userAgent, systemInfo, additionalInfo } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Error message is required" });
    }

    const error = new Error(message);
    error.stack = stack || "No stack trace provided";
    error.name = "FrontendError";

    const context = {
      component,
      url,
      userAgent,
      systemInfo,
      ...additionalInfo,
      reportedFrom: "frontend"
    };

    // Send email to admin
    await sendErrorToAdmin(error, context);

    return res.status(200).json({ success: true, message: "Error reported successfully" });
  } catch (error: any) {
    console.error("Failed to report frontend error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
