import { prisma } from "../../prisma";
import { subDays, subWeeks, subMonths } from "date-fns";
import { formatISTDateKey } from "@/lib/utils/date-utils";

interface UsageAnalyticsFilters {
  role?: string;
  classId?: string;
  branchId?: string;
}

export async function getBasicUsageAnalytics(filters: UsageAnalyticsFilters) {
  const roles = ["staff", "student", "parent"];
  const now = new Date();

  const dailySince = subDays(now, 1);
  const weeklySince = subWeeks(now, 1);
  const monthlySince = subMonths(now, 1);

  const dailyActiveUsers: Record<string, number> = {};
  const weeklyActiveUsers: Record<string, number> = {};
  const monthlyActiveUsers: Record<string, number> = {};
  const inactiveUsers: Record<string, number> = {};

  for (const r of roles) {
    if (filters.role && filters.role !== r) {
      dailyActiveUsers[r] = 0;
      weeklyActiveUsers[r] = 0;
      monthlyActiveUsers[r] = 0;
      inactiveUsers[r] = 0;
      continue;
    }
    dailyActiveUsers[r] = await prisma.userLoginLog.count({
      where: { role: r, timestamp: { gte: dailySince } },
    });
    weeklyActiveUsers[r] = await prisma.userLoginLog.count({
      where: { role: r, timestamp: { gte: weeklySince } },
    });
    monthlyActiveUsers[r] = await prisma.userLoginLog.count({
      where: { role: r, timestamp: { gte: monthlySince } },
    });
    inactiveUsers[r] = await prisma.userLoginLog.count({
      where: { role: r, timestamp: { lt: subDays(now, 7) } },
    });
  }

  const rawLogin = await prisma.userLoginLog.findMany({
    where: { timestamp: { gte: subDays(now, 30) } },
    orderBy: { timestamp: "asc" },
  });
  const loginMap: Record<string, any> = {};
  rawLogin.forEach((log) => {
    const date = formatISTDateKey(new Date(log.timestamp));
    if (!loginMap[date]) loginMap[date] = { date, staff: 0, student: 0, parent: 0 };
    (loginMap[date][log.role as "staff" | "student" | "parent"] as number)++;
  });
  const loginFrequencyGraph = Object.values(loginMap);

  const topModulesRaw = await prisma.moduleUsageLog.groupBy({
    by: ["moduleName"],
    _count: { moduleName: true },
    orderBy: { _count: { moduleName: "desc" } },
    take: 5,
  });
  const topModulesUsed = topModulesRaw.map((m) => ({
    module: m.moduleName,
    hits: m._count.moduleName,
  }));

  return {
    dailyActiveUsers,
    weeklyActiveUsers,
    monthlyActiveUsers,
    inactiveUsers,
    loginFrequencyGraph,
    topModulesUsed,
  };
}
