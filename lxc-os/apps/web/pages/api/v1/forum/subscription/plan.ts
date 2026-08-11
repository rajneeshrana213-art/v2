import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

const VALID_EDUCATION_LEVELS = ["school", "college", "competitive"] as const;
type EducationLevel = (typeof VALID_EDUCATION_LEVELS)[number];

const GOAL_PLAN_MAP: Record<EducationLevel, string> = {
  school: "ignite",
  college: "zenith",
  competitive: "apex",
};

function normalizeEducationLevel(value: unknown): EducationLevel | null {
  return typeof value === "string" && VALID_EDUCATION_LEVELS.includes(value as EducationLevel)
    ? (value as EducationLevel)
    : null;
}

/**
 * GET /api/v1/forum/subscription/plan
 *
 * Returns the current user's active forum plan.
 * If no active plan exists or it has expired → returns { planKey: 'free' }.
 * Used by the frontend on every dashboard load to enforce module access.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const now = new Date();
    const profile = await prisma.forumUserProfile.findUnique({
      where: { userId: user.id },
      select: { educationLevel: true },
    });
    const educationLevel = normalizeEducationLevel(profile?.educationLevel);
    const recommendedPlanKey = educationLevel ? GOAL_PLAN_MAP[educationLevel] : "ignite";

    // Find the most recent active subscription for this forum user
    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        isDeleted: false,
        isActive: true,
        status: { in: [SubscriptionStatus.ACTIVE] },
        endDate: { gte: now },
      },
      orderBy: { endDate: "desc" },
      select: {
        id: true,
        planKey: true,
        status: true,
        startDate: true,
        endDate: true,
        billingCycle: true,
        isAutoRenewEnabled: true,
        plan: { select: { name: true, price: true } },
        payment: { select: { amount: true, paymentMethod: true, paymentDate: true } },
      },
    });

    // Also fetch billing history (last 5 payments)
    const billingHistory = await prisma.subscription.findMany({
      where: { userId: user.id, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        planKey: true,
        status: true,
        startDate: true,
        endDate: true,
        billingCycle: true,
        payment: {
          select: {
            amount: true,
            paymentMethod: true,
            paymentDate: true,
            razorpayPaymentId: true,
            status: true,
          },
        },
      },
    });

    if (!activeSub) {
      return res.status(200).json({
        planKey: "free",
        isActive: false,
        educationLevel,
        recommendedPlanKey,
        billingHistory,
      });
    }

    return res.status(200).json({
      planKey: activeSub.planKey || "free",
      status: activeSub.status,
      startDate: activeSub.startDate,
      endDate: activeSub.endDate,
      billingCycle: activeSub.billingCycle,
      isAutoRenew: activeSub.isAutoRenewEnabled,
      planName: activeSub.plan?.name,
      amount: activeSub.payment?.amount,
      paymentMethod: activeSub.payment?.paymentMethod,
      isActive: true,
      educationLevel,
      recommendedPlanKey,
      billingHistory,
    });
  } catch (error: any) {
    console.error("[get-plan] Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch plan." });
  }
}
