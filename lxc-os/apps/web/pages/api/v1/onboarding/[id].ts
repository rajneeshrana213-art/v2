
import { NextApiRequest, NextApiResponse } from "next";
import { OnboardingService } from "../../../../lib/services/onboarding-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";
import { OnboardingStatus } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Onboarding ID is required" });
  }

  try {
    if (req.method === "GET") {
      const onboarding = await OnboardingService.getOnboardingById(id);
      return res.status(200).json(onboarding);
    }
    
    if (req.method === "PATCH") {
      const { status, assignedToId, steps, stepKey, stepData } = req.body;

      if (stepKey && stepData) {
        // Update a specific step
        const onboarding = await OnboardingService.updateStep(id, stepKey, stepData);
        return res.status(200).json(onboarding);
      } else {
        // Update onboarding general data
        const onboarding = await OnboardingService.updateOnboarding(id, {
          status: status as OnboardingStatus,
          assignedToId,
          steps
        });
        return res.status(200).json(onboarding);
      }
    }

    if (req.method === "DELETE") {
      await OnboardingService.deleteOnboarding(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Onboarding API Error:", error);
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ error: error.message || "Internal server error" });
  }
}

