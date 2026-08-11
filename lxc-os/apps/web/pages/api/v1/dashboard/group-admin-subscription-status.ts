import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

type OrgSubscriptionStatus = "NONE" | "ACTIVE" | "GRACE" | "EXPIRED_AFTER_GRACE";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== "group_admin") {
      return res.status(403).json({ error: "Forbidden: group_admin access required" });
    }

    if (!user.schoolGroupId) {
      return res.status(400).json({ error: "User is not associated with an organization" });
    }

    const now = new Date();

    const subscription = await prisma.subscription.findFirst({
      where: {
        schoolGroupId: user.schoolGroupId,
        isActive: true,
      },
      orderBy: { endDate: "desc" },
      include: { plan: { select: { name: true } } },
    });
    console.log("[DEBUG] group-admin-subscription-status: Found sub:", subscription ? { id: subscription.id, plan: subscription.plan.name } : "NONE");

    let status: OrgSubscriptionStatus = "NONE";
    let remainingDays = 0;

    if (subscription) {
      const endDate = new Date(subscription.endDate);
      const diffMs = endDate.getTime() - now.getTime();
      remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      const graceDays = 0; // No grace period config for groups yet; extend later
      const graceEndDate = new Date(endDate);
      graceEndDate.setDate(graceEndDate.getDate() + graceDays);

      if (subscription.status === "ACTIVE" && now <= endDate) {
        status = "ACTIVE";
      } else if (now > endDate && now <= graceEndDate) {
        status = "GRACE";
      } else if (now > graceEndDate) {
        status = "EXPIRED_AFTER_GRACE";
      }
    }

    const payload = {
      data: {
        status,
        remainingDays,
        planName: subscription?.plan?.name ?? null,
        endDate: subscription?.endDate ?? null,
      },
    };
    console.log("[DEBUG] group-admin-subscription-status: Returning payload:", payload);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Error fetching group-admin subscription status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
