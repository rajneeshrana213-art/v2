
import { NextApiRequest, NextApiResponse } from "next";
import { OnboardingService } from "../../../../lib/services/onboarding-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";
import { OnboardingStatus } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      const { searchTerm, status, page, limit } = req.query;
      
      const onboardingsData = await OnboardingService.getOnboardings({
        userId: user.role === 'employee' ? user.id : undefined,
        searchTerm: searchTerm as string,
        status: status as OnboardingStatus,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      
      return res.status(200).json(onboardingsData);
    } 
    
    if (req.method === "POST") {
      const { schoolId, assignedToId, status, steps } = req.body;
      
      if (!schoolId) {
        return res.status(400).json({ error: "School ID is required" });
      }

      const onboarding = await OnboardingService.createOnboarding({
        schoolId,
        assignedToId: assignedToId || user.id,
        status: status as OnboardingStatus,
        steps
      });

      return res.status(201).json(onboarding);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Onboarding API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

