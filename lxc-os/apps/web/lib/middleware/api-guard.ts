import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { withApiLogger } from "@/lib/utils/logger";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<any> | any;

/**
 * Derive a human-readable module name from the request URL.
 * Returns null for auth / public / superadmin / analytics routes
 * that shouldn't be counted as module usage.
 */
function detectModule(url: string | undefined): string | null {
  if (!url) return null;
  // Strip query string
  const path = url.split("?")[0].toLowerCase();

  if (path.includes("/api/v1/finance/subscription")) return null;
  if (path.includes("/api/v1/finance")) return "Finance Engine";
  if (path.includes("/api/v1/student")) return "Student Portal";
  if (path.includes("/api/v1/academic")) return "Academic Mgmt";
  if (path.includes("/api/v1/attendance")) return "Attendance";
  if (path.includes("/api/v1/transport")) return "Transport";
  if (path.includes("/api/v1/hostel")) return "Hostel";
  if (path.includes("/api/v1/library")) return "Library";
  if (path.includes("/api/v1/employee")) return "HRM";
  if (path.includes("/api/v1/communication")) return "Communication";
  if (path.includes("/api/v1/notification")) return "Communication";
  if (path.includes("/api/v1/teacher")) return "Academic Mgmt";
  if (path.includes("/api/v1/project")) return "Projects";
  if (path.includes("/api/v1/forum")) return "Forum";
  if (path.includes("/api/v1/ai")) return "AI Assistant";

  return null;
}

/** Fire-and-forget: log a module access without blocking the request */
function logModuleUsage(userId: string, moduleName: string): void {
  prisma.moduleUsageLog.create({ data: { userId, moduleName } }).catch(() => {
    /* non-critical — silently discard */
  });
}

export const withAuth = (handler: ApiHandler, allowedRoles?: Role[]) => {
  return withApiLogger(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // 1. Try session-based auth first (for web)
      const session = await getServerSession(req, res, authOptions);
      let user = session?.user;
      let deviceType = "web";

      // 2. Fallback to Bearer token (for mobile/app)
      if (!user) {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
          user = await verifyAuth(token);
          deviceType = "app";
        }
      }

      if (!user) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No valid session or token" });
      }

      // 3. Check Role
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role as Role)) {
          // Superadmin override? Usually yes.
          if ((user.role as Role) !== Role.superadmin) {
            return res
              .status(403)
              .json({ error: "Forbidden: Insufficient permissions" });
          }
        }
      }

      // 4. Track activity & detect device (fire-and-forget, zero latency impact)
      const moduleName = detectModule(req.url);
      if (user.id) {
        // deviceType is already determined above accurately based on session availability

        // Update user activity timestamp for duration monitoring
        prisma.user.update({
          where: { id: user.id },
          data: { lastOnline: new Date() }
        }).catch(() => {});

        // Log to UsageLog for Web/App distinction (SaaS-grade monitoring)
        // Skip logging for internal dashboard polling/monitoring to avoid artificial count inflation
        const isInternalMonitoring = req.url?.includes("/api/v1/superadmin") || !moduleName;

        if (!isInternalMonitoring) {
          prisma.usageLog.create({
            data: {
              userId: user.id,
              schoolId: user.schoolId || "system",
              role: user.role as Role,
              module: moduleName || "System",
              deviceType: deviceType,
              timestamp: new Date(),
            }
          }).catch(() => {});
        }

        if (moduleName) {
          logModuleUsage(user.id, moduleName);
        }
      }

      // 5. Subscription Enforcement (SaaS-grade)
      if (user.role !== Role.superadmin && user.schoolId) {
        // Only check if it's a module that requires subscription
        if (moduleName) {
          const { SubscriptionService } = await import("../services/finance/subscription-service");
          const access = await SubscriptionService.checkAccess(user.schoolId);
          if (!access.hasAccess) {
            return res.status(402).json({
              error: "Payment Required",
              message: "Your subscription has expired. Please renew to continue using this module.",
              reason: access.reason
            });
          }
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error("Auth Guard Error:", error);
      return res.status(401).json({ error: "Unauthorized" });
    }
  });
};
