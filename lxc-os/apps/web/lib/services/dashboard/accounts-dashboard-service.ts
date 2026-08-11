
import { prisma } from "../../prisma";
import { PaymentStatus } from "@prisma/client";

export const AccountsDashboardService = {
  async getDashboardData() {
    const [
      totalSchools,
      totalPlans,
      totalCoupons,
      activeSubscriptions,
      planPayments,
      internalIncome,
      internalExpenses,
      recentPlanPayments,
      recentInternalIncome,
      recentInternalExpenses,
      planDistribution,
      internalExpenseCategories,
    ] = await Promise.all([
      // Total Schools
      prisma.school.count(),
      // Total Plans
      prisma.plan.count(),
      // Total Coupons
      prisma.coupon.count(),
      // Active Subscriptions
      prisma.subscription.count({ where: { isActive: true } }),
      // Plan Revenue (Completed Payments)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED, planId: { not: null } },
      }),
      // Internal Income
      prisma.internalIncome.aggregate({
        _sum: { amount: true },
      }),
      // Internal Expenses
      prisma.internalExpense.aggregate({
        _sum: { amount: true },
      }),
      // Recent Plan Payments
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { planId: { not: null } },
        include: {
          school: { select: { schoolName: true, schoolLogo: true } },
          plan: { select: { name: true } },
        },
      }),
      // Recent Internal Income
      prisma.internalIncome.findMany({
        take: 5,
        orderBy: { date: "desc" },
      }),
      // Recent Internal Expenses
      prisma.internalExpense.findMany({
        take: 5,
        orderBy: { date: "desc" },
        include: { category: true },
      }),
      // Plan Distribution
      prisma.plan.findMany({
        include: {
          _count: {
            select: { subscription: { where: { isActive: true } } },
          },
        },
      }),
      // Expense Categories
      prisma.internalExpenseCategory.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    // Financial calculations
    const totalPlanRevenue = planPayments._sum?.amount || 0;
    const totalInternalIncome = internalIncome._sum?.amount || 0;
    const totalRevenue = totalPlanRevenue + totalInternalIncome;
    const totalExpenses = internalExpenses._sum?.amount || 0;
    const netProfit = totalRevenue - totalExpenses;

    const [activeCoupons, expiredCoupons, expenseBreakdown] = await Promise.all([
      prisma.coupon.count({
        where: {
          isActive: true,
          expiryDate: { gte: new Date() },
        },
      }),
      prisma.coupon.count({
        where: {
          OR: [{ isActive: false }, { expiryDate: { lt: new Date() } }],
        },
      }),
      prisma.internalExpense.groupBy({
        by: ["categoryId"],
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }).then(async (results) => {
        const categoryIds = results.map(r => r.categoryId);
        const categories = await prisma.internalExpenseCategory.findMany({
          where: { id: { in: categoryIds } },
        });
        const catMap = new Map(categories.map(c => [c.id, c.name]));
        return results.map(r => ({
          name: catMap.get(r.categoryId) || "Other",
          value: r._sum.amount || 0,
        }));
      }),
    ]);

    // Monthly data for chart (Last 6 months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toISOString().slice(0, 7);
    }).reverse();

    const monthlyFinancials = await Promise.all(
      last6Months.map(async (month) => {
        const startOfMonth = new Date(`${month}-01`);
        const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));

        const [monthPlanRev, monthInternalInc, monthExp] = await Promise.all([
          prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
              status: PaymentStatus.COMPLETED,
              planId: { not: null },
              paymentDate: { gte: startOfMonth, lt: endOfMonth },
            },
          }),
          prisma.internalIncome.aggregate({
            _sum: { amount: true },
            where: { date: { gte: startOfMonth, lt: endOfMonth } },
          }),
          prisma.internalExpense.aggregate({
            _sum: { amount: true },
            where: { date: { gte: startOfMonth, lt: endOfMonth } },
          }),
        ]);

        return {
          month,
          revenue: (monthPlanRev._sum?.amount || 0) + (monthInternalInc._sum?.amount || 0),
          expense: monthExp._sum?.amount || 0,
        };
      })
    );

    return {
      stats: {
        totalSchools,
        totalPlans,
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        activeSubscriptions,
        totalRevenue,
        totalExpenses,
        netProfit,
      },
      graphData: {
        monthlyFinancials,
        planDistribution: planDistribution.map((p) => ({
          name: p.name,
          value: p._count.subscription,
        })),
        expenseBreakdown,
      },
      recentActivity: {
        planPayments: recentPlanPayments,
        internalIncome: recentInternalIncome,
        internalExpenses: recentInternalExpenses,
      },
      categories: internalExpenseCategories,
    };
  },
};
