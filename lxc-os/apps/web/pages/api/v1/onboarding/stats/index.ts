
import { NextApiRequest, NextApiResponse } from "next";
import { OnboardingService } from "../../../../../lib/services/onboarding-service";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    const stats = await OnboardingService.getStats(
      user.role === 'employee' ? user.id : undefined
    );
    return res.status(200).json(stats);
  } catch (error: any) {
    console.error("Onboarding Stats API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

