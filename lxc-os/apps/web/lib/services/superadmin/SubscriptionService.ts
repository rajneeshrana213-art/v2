import { prisma } from "@/lib/prisma";

export class SubscriptionService {
  /**
   * Validates if a school can add more users based on its current plan/limit.
   * Throws an error if the limit is reached and no overage is allowed.
   */
  static async validateUserLimit(schoolId: string) {
    if (process.env.APP_ENV === "development") return true;

    const config = await prisma.schoolSubscriptionConfig.findUnique({
      where: { schoolId },
    });

    if (!config) return true;

    const userCount = await prisma.user.count({
      where: {
        schoolId,
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
          ],
        },
      },
    });

    if (config.planModel === "MODEL_B") {
      const totalAllowed = config.allowedUsers + (config.bonusUsers || 0);
      if (userCount >= totalAllowed) {
        throw new Error(
          `User limit reached (${totalAllowed}). Please upgrade the plan or increase the limit.`,
        );
      }
    }

    return true;
  }

  /**
   * Validates if a school can add a specific number of users based on its current plan/limit.
   * Throws an error (with details) if the limit would be exceeded.
   */
  static async validateBulkLimit(schoolId: string, requestedCount: number) {
    if (process.env.APP_ENV === "development") return true;

    const stats = await this.getUsageStats(schoolId);
    
    if (stats.model === "MODEL_B") {
      const totalAllowed = stats.allowedUsers + stats.bonusUsers;
      const remaining = Math.max(0, totalAllowed - stats.currentUsers);

      if (requestedCount > remaining) {
        const error = new Error(`Insufficient student limit. Remaining: ${remaining}, Requested: ${requestedCount}. Please upgrade your plan.`);
        (error as any).details = {
          remaining,
          requested: requestedCount,
          current: stats.currentUsers,
          allowed: totalAllowed
        };
        throw error;
      }
    }

    return true;
  }

  /**
   * Checks if a school's subscription is in a state that allows writes (e.g., not expired or in grace period).
   * Also handles auto-suspension if configured.
   */
  static async checkWriteAccess(schoolId: string) {
    if (process.env.APP_ENV === "development") return true;

    const config = await prisma.schoolSubscriptionConfig.findUnique({
      where: { schoolId },
    });

    if (!config) return true;

    // Check for expired subscription beyond grace period
    const subscription = await prisma.subscription.findFirst({
      where: { schoolId, isActive: true },
      orderBy: { endDate: "desc" },
    });

    if (subscription && subscription.status !== "ACTIVE") {
      const now = new Date();
      const graceEndDate = new Date(subscription.endDate);
      graceEndDate.setDate(graceEndDate.getDate() + config.gracePeriodDays);

      if (now > graceEndDate) {
        // Apply auto-suspension if enabled
        if (config.autoSuspendAfterGrace) {
          await prisma.school.update({
            where: { id: schoolId },
            data: { isActive: false },
          });
          throw new Error(
            "This school's account has been automatically suspended due to payment failure beyond the grace period.",
          );
        }

        // Apply read-only if enabled
        if (config.isReadOnlyAfterGrace) {
          throw new Error(
            "This school's account is in Read-Only mode due to an expired subscription and grace period.",
          );
        }
      }
    }

    return true;
  }

  /**
   * Waives overage by adding bonus users.
   */
  static async waiveOverage(schoolId: string) {
    const stats = await this.getUsageStats(schoolId);
    const overageCount = Math.max(0, stats.currentUsers - stats.allowedUsers);

    // Add enough bonus users to cover current excess
    return prisma.schoolSubscriptionConfig.update({
      where: { schoolId },
      data: { bonusUsers: overageCount },
    });
  }

  /**
   * Utility to get current usage stats for a school
   */
  static async getUsageStats(schoolId: string) {
    const [userCount, config] = await Promise.all([
      prisma.user.count({
        where: {
          schoolId,
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
            ],
          },
        },
      }),
      prisma.schoolSubscriptionConfig.findUnique({ where: { schoolId } }),
    ]);

    return {
      currentUsers: userCount,
      allowedUsers: config?.allowedUsers || 0,
      bonusUsers: config?.bonusUsers || 0,
      model: config?.planModel || "MODEL_A",
    };
  }
}
