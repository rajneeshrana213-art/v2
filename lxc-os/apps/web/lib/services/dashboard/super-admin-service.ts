import { prisma } from "../../prisma";
import { PaymentStatus, TicketStatus } from "@prisma/client";
import { formatISTDateKey, getISTHours } from "@/lib/utils/date-utils";

export const SuperAdminService = {
  async getDashboardData() {
    const [
      totalUsers,
      activeUsers,
      users,
      usersByRole,
      totalSchools,
      activeSchools,
      schools,
      totalPlans,
      activePlans,
      totalEmployees,
      activeEmployees,
      totalRevenue,
      paidPayments,
      outstandingPayments,
      recentPayments,
      monthlyPayments,
      totalRequests,
      errorRequests,
      avgResponseTime,
      openTickets,
      closedTickets,
      totalFeedbacks,
      recentTickets,
      recentFeedbacks,
      recentSchools,
      recentUsers,
      recentSubscriptions,
      totalStudents,
      totalTeachers,
      totalParents,
      subscriptionsExpiringSoon,
      activeSubscriptions,
      failedPaymentsCount,
    ] = await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.user.count({
        where: {
          isDeleted: false,
          lastOnline: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
      prisma.user.findMany({
        where: {
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
        select: { createdAt: true },
      }),
      prisma.user.groupBy({
        by: ["role"],
        where: { isDeleted: false },
        _count: true,
      }),
      prisma.school.count({ where: { isDeleted: false } }),
      prisma.subscription.count({
        where: { isActive: true },
      }),
      prisma.school.findMany({
        where: {
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
        select: { createdAt: true },
      }),
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { isActive: true },
      }),
      prisma.user.count({ where: { role: "employee", isDeleted: false } }),
      prisma.user.count({
        where: {
          role: "employee",
          isDeleted: false,
          lastOnline: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED },
      }),
      prisma.payment.findMany({
        where: {
          status: PaymentStatus.COMPLETED,
          paymentDate: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            not: null,
          },
        },
        select: { paymentDate: true, amount: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: { in: [PaymentStatus.PENDING] } },
      }),
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          subscription: {
            include: {
              school: {
                select: { schoolName: true, schoolLogo: true },
              },
            },
          },
          school: {
            select: { schoolName: true, schoolLogo: true },
          },
        },
      }),
      prisma.payment.findMany({
        where: {
          status: PaymentStatus.COMPLETED,
          paymentDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            not: null,
          },
        },
        select: { paymentDate: true, amount: true },
      }),
      prisma.log.count(),
      prisma.log.count({
        where: { status: { gte: 400 } },
      }),
      prisma.log.aggregate({
        _avg: { duration: true },
      }),
      prisma.ticket.count({
        where: { status: TicketStatus.OPEN },
      }),
      prisma.ticket.findMany({
        where: { status: TicketStatus.CLOSED },
        select: { createdAt: true, updatedAt: true },
      }),
      prisma.feedback.count(),
      prisma.ticket.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          User: {
            select: { name: true, email: true },
          },
          School: {
            select: { schoolName: true },
          },
        },
      }),
      prisma.feedback.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          School: {
            select: { schoolName: true },
          },
        },
      }),
      prisma.school.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
          subscription: {
            where: { isActive: true },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.user.findMany({
        where: { isDeleted: false },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          school: {
            select: { schoolName: true },
          },
        },
      }),
      prisma.subscription.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          school: {
            select: { schoolName: true, schoolLogo: true },
          },
        },
      }),
      prisma.user.count({ where: { role: "student", isDeleted: false } }),
      prisma.user.count({ where: { role: "teacher", isDeleted: false } }),
      prisma.user.count({ where: { role: "parent", isDeleted: false } }),
      prisma.subscription.findMany({
        where: {
          isActive: true,
          endDate: {
            gte: new Date(),
            lte: new Date(new Date().setDate(new Date().getDate() + 30)),
          },
        },
        include: {
          school: {
            select: { schoolName: true },
          },
        },
      }),
      // Active subscriptions for MRR calculation
      prisma.subscription.findMany({
        where: { isActive: true },
        include: { plan: true },
      }),
      // Failed payments
      prisma.payment.count({
        where: { status: PaymentStatus.FAILED },
      }),
    ]);

    // MRR Calculation
    const totalMrr = activeSubscriptions.reduce((acc, sub) => {
      const plan = sub.plan;
      if (!plan || plan.price <= 0) return acc;
      // Normalize to monthly: (Price / DurationDays) * 30
      const monthlyValue = (plan.price / (plan.durationDays || 30)) * 30;
      return acc + monthlyValue;
    }, 0);

    // Processing monthly data
    const monthlyNewUsers = users.reduce(
      (acc: any, user: any) => {
        const month = user.createdAt.toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const monthlyNewUsersArray: any = Object.entries(monthlyNewUsers)
      .map(([month, count]: [string, any]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const monthlyNewSchools = schools.reduce(
      (acc: any, school: any) => {
        const month = school.createdAt.toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const monthlyNewSchoolsArray: any = Object.entries(monthlyNewSchools)
      .map(([month, count]: [string, any]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const monthlyRevenue = paidPayments.reduce(
      (acc: any, payment: any) => {
        const month = payment.paymentDate!.toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + payment.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const monthlyRevenueArray: any = Object.entries(monthlyRevenue)
      .map(([month, revenue]: [string, any]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const last6MonthsRevenue = monthlyPayments.reduce(
      (acc: any, payment: any) => {
        const month = payment.paymentDate!.toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + payment.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const lastMonthUsers =
      monthlyNewUsersArray[monthlyNewUsersArray.length - 2]?.count || 0;
    const currentMonthUsers =
      monthlyNewUsersArray[monthlyNewUsersArray.length - 1]?.count || 0;
    const userGrowth = calculateGrowth(currentMonthUsers, lastMonthUsers);

    const lastMonthSchools =
      monthlyNewSchoolsArray[monthlyNewSchoolsArray.length - 2]?.count || 0;
    const currentMonthSchools =
      monthlyNewSchoolsArray[monthlyNewSchoolsArray.length - 1]?.count || 0;
    const schoolGrowth = calculateGrowth(currentMonthSchools, lastMonthSchools);

    const resolutionTimes = closedTickets.map(
      (ticket) =>
        (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) /
        (1000 * 60 * 60),
    );
    const avgResolutionTimeValue =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;

    const errorRate =
      totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.COMPLETED,
        paymentDate: { gte: today },
      },
    });

    const todayNewUsers = await prisma.user.count({
      where: { createdAt: { gte: today }, isDeleted: false },
    });

    const todayNewSchools = await prisma.school.count({
      where: { createdAt: { gte: today }, isDeleted: false },
    });

    // Additional comprehensive metrics
    const [
      topSchoolsByRevenue,
      topUsersByActivity,
      moduleUsageStats,
      paymentMethodBreakdown,
      ticketPriorityBreakdown,
      schoolPerformanceMetrics,
      geographicDistribution,
      weeklyTrends,
      hourlyActivity,
      planDistribution,
    ] = await Promise.all([
      // Top Schools by Revenue
      prisma.payment
        .groupBy({
          by: ["schoolId"],
          where: {
            status: PaymentStatus.COMPLETED,
            paymentDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
            },
          },
          _sum: { amount: true },
          _count: true,
          orderBy: { _sum: { amount: "desc" } },
          take: 10,
        })
        .then(async (results) => {
          const schoolIds = results
            .map((r) => r.schoolId)
            .filter(Boolean) as string[];
          const schools = await prisma.school.findMany({
            where: { id: { in: schoolIds } },
            select: { id: true, schoolName: true, schoolLogo: true },
          });
          const schoolMap = new Map(schools.map((s) => [s.id, s]));
          return results.map((r) => ({
            schoolId: r.schoolId,
            schoolName:
              schoolMap.get(r.schoolId || "")?.schoolName || "Unknown",
            schoolLogo: schoolMap.get(r.schoolId || "")?.schoolLogo || null,
            totalRevenue: r._sum.amount || 0,
            paymentCount: r._count,
          }));
        }),

      // Top Users by Activity (based on usage logs)
      prisma.usageLog
        .groupBy({
          by: ["userId"],
          _count: true,
          _sum: { duration: true },
          orderBy: { _count: { userId: "desc" } },
          take: 10,
        })
        .then(async (results) => {
          const userIds = results.map((r) => r.userId);
          const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profilePic: true,
            },
          });
          const userMap = new Map(users.map((u) => [u.id, u]));
          return results.map((r) => ({
            userId: r.userId,
            userName: userMap.get(r.userId)?.name || "Unknown",
            userEmail: userMap.get(r.userId)?.email || "",
            role: userMap.get(r.userId)?.role || "",
            profilePic: userMap.get(r.userId)?.profilePic || null,
            sessionCount: r._count,
            totalDuration: r._sum.duration || 0,
          }));
        }),

      // Module Usage Statistics
      prisma.usageLog
        .groupBy({
          by: ["module"],
          _count: true,
          _sum: { duration: true },
          orderBy: { _count: { module: "desc" } },
          take: 15,
        })
        .then((results) =>
          results.map((r) => ({
            module: r.module,
            sessionCount: r._count,
            totalDuration: r._sum.duration || 0,
            avgDuration:
              r._count > 0 ? Math.round((r._sum.duration || 0) / r._count) : 0,
          })),
        ),

      // Payment Method Breakdown
      prisma.payment.groupBy({
        by: ["paymentMethod"],
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
        _count: true,
      }),

      // Ticket Priority Breakdown
      prisma.ticket.groupBy({
        by: ["priority", "status"],
        _count: true,
      }),

      // School Performance Metrics
      prisma.school
        .findMany({
          take: 20,
          include: {
            subscription: {
              where: { isActive: true },
              take: 1,
              orderBy: { createdAt: "desc" },
            },
            _count: {
              select: {
                students: true,
                teachers: true,
                ticket: true,
                // logs: true // removed logs as it might be heavy and not on school relation directly sometimes
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
        .then((schools) =>
          schools.map((school) => ({
            id: school.id,
            schoolName: school.schoolName,
            schoolLogo: school.schoolLogo,
            studentCount: school._count.students,
            teacherCount: school._count.teachers,
            ticketCount: school._count.ticket,
            hasActiveSubscription: school.subscription.length > 0,
            subscriptionEndDate: school.subscription[0]?.endDate || null,
          })),
        ),

      // Geographic Distribution (from user addresses)
      prisma.user
        .groupBy({
          by: ["state"],
          where: { role: "admin", schoolId: { not: null } },
          _count: true,
        })
        .then((results: any[]) =>
          results.sort((a, b) => b._count - a._count).slice(0, 10),
        ),

      // Weekly Trends (last 8 weeks)
      prisma.payment
        .findMany({
          where: {
            status: PaymentStatus.COMPLETED,
            paymentDate: {
              gte: new Date(new Date().setDate(new Date().getDate() - 56)),
              not: null,
            },
          },
          select: { paymentDate: true, amount: true },
        })
        .then((payments) => {
          const weeklyData: Record<string, number> = {};
          payments.forEach((payment) => {
            const date = new Date(payment.paymentDate!);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = formatISTDateKey(weekStart);
            weeklyData[weekKey] = (weeklyData[weekKey] || 0) + payment.amount;
          });
          return Object.entries(weeklyData)
            .map(([week, revenue]) => ({ week, revenue }))
            .sort((a, b) => a.week.localeCompare(b.week));
        }),

      // Hourly Activity (last 7 days)
      prisma.usageLog
        .findMany({
          where: {
            timestamp: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
          select: { timestamp: true },
        })
        .then((logs) => {
          const hourlyData: Record<number, number> = {};
          logs.forEach((log) => {
            const hour = getISTHours(new Date(log.timestamp));
            hourlyData[hour] = (hourlyData[hour] || 0) + 1;
          });
          return Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            count: hourlyData[i] || 0,
          }));
        }),

      // Plan Distribution
      prisma.subscription
        .groupBy({
          by: ["planId"],
          _count: true,
          where: { isActive: true },
        })
        .then(async (results) => {
          const planIds = results
            .map((r) => r.planId)
            .filter(Boolean) as string[];
          const plans = await prisma.plan.findMany({
            where: { id: { in: planIds } },
            select: { id: true, name: true, price: true },
          });
          const planMap = new Map(plans.map((p) => [p.id, p]));
          return results.map((r) => ({
            planId: r.planId,
            planName: planMap.get(r.planId || "")?.name || "Unknown",
            planPrice: planMap.get(r.planId || "")?.price || 0,
            subscriptionCount: r._count,
          }));
        }),
    ]);

    return {
      userStatistics: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        monthlyNewUsers: monthlyNewUsersArray,
        usersByRole: usersByRole.reduce(
          (acc: any, item) => {
            acc[item.role] = item._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
        totalStudents,
        totalTeachers,
        totalParents,
        userGrowth: parseFloat(userGrowth.toFixed(2)),
      },
      schoolStatistics: {
        totalSchools,
        activeSchools,
        inactiveSchools: totalSchools - activeSchools,
        monthlyNewSchools: monthlyNewSchoolsArray,
        schoolGrowth: parseFloat(schoolGrowth.toFixed(2)),
      },
      planStatistics: {
        totalPlans,
        activePlans,
        inactivePlans: totalPlans - activePlans,
      },
      employeeStatistics: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
      },
      financialMetrics: {
        totalRevenue: totalRevenue._sum?.amount || 0,
        monthlyRevenue: monthlyRevenueArray,
        last6MonthsRevenue: Object.entries(last6MonthsRevenue)
          .map(([month, revenue]: [string, any]) => ({ month, revenue }))
          .sort((a, b) => a.month.localeCompare(b.month)),
        outstandingPayments: outstandingPayments._sum?.amount || 0,
        todayRevenue: todayRevenue._sum?.amount || 0,
        mrr: Math.round(totalMrr),
        arr: Math.round(totalMrr * 12),
        failedPayments: failedPaymentsCount,
      },
      systemHealth: {
        errorRate: parseFloat(errorRate.toFixed(2)),
        avgResponseTime: avgResponseTime._avg.duration || 0,
        totalRequests,
        errorRequests,
        successRate: parseFloat(
          (
            ((totalRequests - errorRequests) / (totalRequests || 1)) *
            100
          ).toFixed(2),
        ),
      },
      supportAndFeedback: {
        openTickets,
        closedTickets: closedTickets.length,
        avgResolutionTime: parseFloat(avgResolutionTimeValue.toFixed(2)),
        totalFeedbacks,
      },
      recentActivity: {
        recentSchools: recentSchools.map((school) => ({
          id: school.id,
          schoolName: school.schoolName,
          schoolLogo: school.schoolLogo,
          adminName: school.user.name,
          adminEmail: school.user.email,
          adminPhone: school.user.phone,
          createdAt: school.createdAt,
          subscription: school.subscription[0] || null,
        })),
        recentUsers: recentUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolName: user.school?.schoolName || null,
          createdAt: user.createdAt,
        })),
        recentPayments: recentPayments.map((payment) => {
          const subscriptions = payment.subscription || [];
          const firstSubscription =
            subscriptions.length > 0 ? subscriptions[0] : null;
          return {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            paymentDate: payment.paymentDate,
            schoolName:
              firstSubscription?.school?.schoolName ||
              payment.school?.schoolName ||
              null,
            schoolLogo:
              firstSubscription?.school?.schoolLogo ||
              payment.school?.schoolLogo ||
              null,
            createdAt: payment.createdAt,
          };
        }),
        recentSubscriptions: recentSubscriptions.map((sub) => ({
          id: sub.id,
          schoolName: sub.school?.schoolName || "Unknown",
          schoolLogo: sub.school?.schoolLogo || null,
          startDate: sub.startDate,
          endDate: sub.endDate,
          isActive: sub.isActive,
          createdAt: sub.createdAt,
        })),
        recentTickets: recentTickets.map((ticket) => ({
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          userName: ticket.User?.name || null,
          userEmail: ticket.User?.email || null,
          schoolName: ticket.School?.schoolName || null,
          createdAt: ticket.createdAt,
        })),
        recentFeedbacks: recentFeedbacks.map((feedback) => ({
          id: feedback.id,
          message: feedback.description,
          rating: 0, // Feedback model doesn't have rating field
          userName: null, // Feedback model doesn't have user relation
          userEmail: null,
          schoolName: feedback.School?.schoolName || null,
          createdAt: feedback.createdAt,
        })),
      },
      todayMetrics: {
        revenue: todayRevenue._sum?.amount || 0,
        newUsers: todayNewUsers,
        newSchools: todayNewSchools,
      },
      alerts: {
        subscriptionsExpiringSoon: subscriptionsExpiringSoon?.length || 0,
        subscriptionsExpiring:
          subscriptionsExpiringSoon?.map((sub) => ({
            id: sub.id,
            schoolName: sub.school?.schoolName || "Unknown",
            endDate: sub.endDate,
            daysRemaining: Math.ceil(
              (sub.endDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          })) || [],
      },
      insights: {
        topSchoolsByRevenue: topSchoolsByRevenue || [],
        topUsersByActivity: topUsersByActivity || [],
        moduleUsageStats: moduleUsageStats || [],
        paymentMethodBreakdown: paymentMethodBreakdown.reduce(
          (acc: any, item) => {
            acc[item.paymentMethod || "UNKNOWN"] = {
              totalAmount: item._sum.amount || 0,
              count: item._count,
            };
            return acc;
          },
          {} as Record<string, { totalAmount: number; count: number }>,
        ),
        ticketPriorityBreakdown: ticketPriorityBreakdown.reduce(
          (acc: any, item) => {
            const key = `${item.priority}_${item.status}`;
            acc[key] = item._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
        schoolPerformanceMetrics: schoolPerformanceMetrics || [],
        geographicDistribution: geographicDistribution.reduce(
          (acc: any, item: any) => {
            acc[item.state || "Unknown"] = item._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
        weeklyTrends: weeklyTrends || [],
        hourlyActivity: hourlyActivity || [],
        planDistribution: planDistribution || [],
      },
    };
  },
  // Employee Dashboard Data
  async getEmployeeDashboardData() {
    const results = await Promise.all([
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.employee.count({ where: { status: "INACTIVE" } }),
      prisma.employee.count(),
      prisma.ticket.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.employee.findMany({
        take: 5,
        include: {
          user: {
            select: { name: true, profilePic: true, email: true, role: true },
          },
          assignedTickets: {
            where: { status: { in: ["RESOLVED", "CLOSED"] } },
          },
        },
      }),
      prisma.employeeAttendance.findMany({
        take: 10,
        orderBy: { date: "desc" },
        include: {
          employee: {
            include: { user: { select: { name: true, profilePic: true } } },
          },
        },
      }),
      prisma.employee.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
        select: { createdAt: true },
      }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.demo.count(),
    ]);

    const [
      activeEmployees,
      suspendedEmployees,
      totalEmployees,
      ticketStatsRaw,
      topPerformersRaw,
      recentAttendanceRaw,
      employeeGrowthRaw,
      totalLeads,
      newLeads,
      totalDemos,
    ] = results;

    // Process employee growth
    const monthlyEmployeeGrowth = employeeGrowthRaw.reduce(
      (acc: any, emp: any) => {
        const month = emp.createdAt.toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const employeeGrowth = Object.entries(monthlyEmployeeGrowth)
      .map(([month, count]: [string, any]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalEmployees: totalEmployees,
      activeEmployees: activeEmployees,
      suspendedEmployees: suspendedEmployees,
      employeeGrowth: employeeGrowth,
      salesMetrics: {
        totalLeads: totalLeads,
        newLeads: newLeads,
        totalDemos: totalDemos,
      },
      ticketStats: ticketStatsRaw.reduce(
        (acc: any, curr: any) => {
          acc[curr.status] = curr._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      topPerformers: topPerformersRaw.map((emp: any) => ({
        id: emp.id,
        name: emp.user.name,
        email: emp.user.email,
        role: emp.user.role,
        profilePic: emp.user.profilePic,
        resolvedTickets: emp.assignedTickets.length,
      })),
      recentAttendance: recentAttendanceRaw.map((att: any) => ({
        id: att.id,
        employeeName: att.employee.user.name,
        profilePic: att.employee.user.profilePic,
        date: att.date,
        status: att.status,
        punchIn: att.punchIn,
        punchOut: att.punchOut,
        workingHours: att.workingHours,
        notes: att.notes,
      })),
    };
  },

  async getAllEmployees() {
    return prisma.employee.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
          },
        },
        department: true,
        designation: true,
      },
      orderBy: { user: { name: "asc" } },
    });
  },

  async assignInternalTask(
    adminId: string,
    data: {
      title: string;
      description: string;
      assignedToId: string;
      priority?: any;
      deadline?: Date;
    },
  ) {
    // Find or create a default Internal Project
    let project = await prisma.project.findFirst({
      where: { name: "Internal" },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: "Internal",
          key: "INT-" + Date.now(),
          description: "Internal company tasks",
          status: "ACTIVE",
          createdBy: adminId,
        } as any,
      });
    }

    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        assignedToId: data.assignedToId,
        createdById: adminId,
        priority: data.priority || "LOW",
        deadline: data.deadline,
        projectId: project.id,
        status: "OPEN",
      },
    });
  },

  async registerOrganization(data: {
    organizationName: string;
    adminName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    password?: string;
    sex: any;
    bloodType: string;
    profilePic?: string;
  }) {
    const hashedPassword = await require("bcryptjs").hash(
      data.password || "tempPass123",
      10,
    );

    return prisma.$transaction(async (tx) => {
      // Create Group Admin User
      const user = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          role: "group_admin",
          sex: data.sex,
          bloodType: data.bloodType,
          profilePic: data.profilePic,
        },
      });

      // Create SchoolGroup
      const group = await tx.schoolGroup.create({
        data: {
          name: data.organizationName,
          ownerId: user.id,
        },
      });

      // Update User with Group ID
      await tx.user.update({
        where: { id: user.id },
        data: {
          schoolGroupId: group.id,
        },
      });

      return { user, group };
    });
  },

  async assignPlanToGroup(
    groupId: string,
    planId: string,
    durationDays: number,
  ) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    // Create a dummy payment for the manual assignment
    const payment = await prisma.payment.create({
      data: {
        amount: 0,
        razorpayOrderId: "MANUAL_" + Date.now(),
        status: "COMPLETED",
        description: "Manual plan assignment by Super Admin",
      },
    });

    return prisma.$transaction(async (tx) => {
      // Create Subscription for the group
      // Note: In this schema, 'subscription' seems to be linked to a single schoolId by default.
      // We'll create it with an empty schoolId or adapt as needed if it relates to a group.
      const sub = await tx.subscription.create({
        data: {
          schoolGroupId: groupId,
          planId: planId,
          startDate,
          endDate,
          isActive: true,
          status: "ACTIVE",
          paymentId: payment.id,
          schoolId: "", // Placeholder if required by schema, but schema says NOT NULL
        } as any,
      });

      return sub;
    });
  },
};
