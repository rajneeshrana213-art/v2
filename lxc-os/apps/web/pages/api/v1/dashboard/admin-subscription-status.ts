import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { getGlobalSettingsByGroup } from "@/lib/cache/globalSettings";

type AdminSubscriptionStatus =
  | "NONE"
  | "ACTIVE"
  | "GRACE"
  | "EXPIRED_AFTER_GRACE";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Disable caching for subscription status
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Expires', '0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return; // verifyAuth handles 401 response

    if (!user?.schoolId) {
      res.status(400).json({ error: "User is not associated with a school" });
      return;
    }

    // Load school details to check for groupId
    const school = await prisma.school.findUnique({
      where: { id: user.schoolId },
      select: { groupId: true }
    });

    // Load per-school subscription config + latest school-level subscription.
    // We fetch the most-recent subscription by endDate regardless of isActive,
    // because `isActive` is lazily updated and may still be `true` for expired subs.
    // Real-time expiry is always computed from the actual endDate + gracePeriodDays.
    const [config, schoolSubscription, groupSubscription] = await Promise.all([
      prisma.schoolSubscriptionConfig.findUnique({
        where: { schoolId: user.schoolId },
      }),
      // Always fetch the latest school-level subscription (ignore stale isActive flag)
      prisma.subscription.findFirst({
        where: { schoolId: user.schoolId },
        orderBy: { endDate: "desc" },
      }),
      // Group-level subscription — only used as fallback
      school?.groupId
        ? prisma.subscription.findFirst({
            where: { schoolGroupId: school.groupId },
            orderBy: { endDate: "desc" },
          })
        : Promise.resolve(null),
    ]);

    // Prefer the school-level subscription. Only fall back to group subscription
    // if there is no school-level record at all.
    const subscription = schoolSubscription ?? groupSubscription;

    let status: AdminSubscriptionStatus = "NONE";
    let isInGrace = false;

    let billingPeriod = "YEAR"; // Default to yearly

    let remainingDays = 0;

    if (subscription) {
      const now = new Date();
      const subEndDate = subscription.endDate ? new Date(subscription.endDate) : null;
      const subStartDate = subscription.startDate ? new Date(subscription.startDate) : null;

      if (subEndDate && !isNaN(subEndDate.getTime())) {
        const diffMs = subEndDate.getTime() - now.getTime();
        remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        if (subStartDate && !isNaN(subStartDate.getTime())) {
          const durationMs = subEndDate.getTime() - subStartDate.getTime();
          const durationDays = durationMs / (1000 * 60 * 60 * 24);
          billingPeriod = durationDays > 1000 ? "THREE_YEARS" : durationDays > 300 ? "YEAR" : "MONTH";
        }

        const graceDays = config?.gracePeriodDays ?? 0;
        const graceEndDate = new Date(subEndDate);
        graceEndDate.setDate(graceEndDate.getDate() + graceDays);

        // Real-time expiry computation — do NOT rely on the DB status field
        // because isActive/status are lazily updated by checkAccess() and may lag.
        if (now <= subEndDate) {
          status = "ACTIVE";
        } else if (now > subEndDate && now <= graceEndDate) {
          status = "GRACE";
          isInGrace = true;
        } else {
          // Past grace period — proactively mark as expired so future
          // queries don't need to re-compute this.
          status = "EXPIRED_AFTER_GRACE";
          if (subscription.isActive) {
            prisma.subscription.update({
              where: { id: subscription.id },
              data: { isActive: false, status: "EXPIRED" },
            }).catch(() => {/* fire-and-forget */});
          }
        }
      }
    }

    // Count total users associated with this school (using same logic as SubscriptionService)
    const activeUsersCount = await prisma.user.count({
      where: {
        schoolId: user.schoolId,
        isDeleted: false,
        role: {
          in: [
            "student",
            "teacher",
            "driver",
            "parent",
            "admin",
            "account",
            "hostel",
            "transport",
            "staff",
            "academics",
            "group_admin",
          ],
        },
      },
    });

    const plan = subscription
      ? await prisma.plan.findUnique({ where: { id: subscription.planId } })
      : null;

    // Use config if exists, otherwise fallback to subscription/plan defaults
    let planModel = config?.planModel ?? (subscription ? "MODEL_B" : "MODEL_A");
    
    // Total allowed users: from config if available, otherwise from subscription directly, or from plan
    let allowedUsers = (config?.allowedUsers ?? 0) + (config?.bonusUsers ?? 0);
    if (!config && subscription) {
        allowedUsers = (subscription as any).userLimit || plan?.userLimit || 0;
    } else if (config && config.allowedUsers === 0 && subscription) {
        // Even if config exists, if allowedUsers is 0, try to fallback to subscription
        allowedUsers = (subscription as any).userLimit || plan?.userLimit || config.bonusUsers || 0;
    }

    // Calculate extra user price with strict priority:
    // 1. School-specific override (if NOT the default 5)
    // 2. Global setting from Super Admin
    // 3. System hardcoded fallback (5)
    
    // Check for 't' query param to force refresh the cache
    const forceRefresh = !!req.query.t;
    const globalSettings = await getGlobalSettingsByGroup("SUBSCRIPTION", forceRefresh);
    const globalDefault = Number(globalSettings["DEFAULT_EXTRA_USER_PRICE"] ?? 5);
    
    const extraUserPrice = (config?.extraUserPrice && config.extraUserPrice !== 5) 
      ? config.extraUserPrice 
      : globalDefault;

    const data = {
      status,
      isInGrace,
      planModel,
      allowedUsers: allowedUsers || 300, // Absolute fallback to 300 or some sensible default
      activeUsersCount,
      billingPeriod,
      remainingDays,
      endDate: subscription?.endDate || null,
      planName: plan?.name || null,
      planId: subscription?.planId || null,
      extraUserPrice,
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("admin-subscription-status error", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
