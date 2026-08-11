
import { prisma } from "../prisma";
import logger from "../utils/logger";

enum KPIType {
  LEADS_GENERATED = "LEADS_GENERATED",
  DEMOS_COMPLETED = "DEMOS_COMPLETED",
  SCHOOLS_ONBOARDED = "SCHOOLS_ONBOARDED",
  TICKETS_RESOLVED = "TICKETS_RESOLVED",
  SALES_REVENUE = "SALES_REVENUE"
}

export const PerformanceService = {
  async getPerformanceData(employeeId: string, period?: string) {
    try {
      const now = new Date();
      const currentPeriod = period || `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
      
      // Get employee to find userId
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { user: { select: { id: true } } }
      });

      if (!employee) {
        throw new Error("Employee not found");
      }

      const userId = employee.userId;

      // Calculate period date range
      const periodParts = currentPeriod.split(' ');
      const monthName = periodParts[0];
      const year = parseInt(periodParts[1]);
      
      // Map month names to indices
      const monthMap: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const monthIndex = monthMap[monthName] ?? new Date(`${monthName} 1, ${year}`).getMonth();
      const periodStart = new Date(year, monthIndex, 1, 0, 0, 0, 0);
      const periodEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      // Get current period KPIs from database
      let databaseKPIs = await prisma.employeeKPI.findMany({
        where: {
          employeeId,
          period: currentPeriod,
        },
        orderBy: { date: 'desc' }
      });

      // Always calculate KPIs from actual data sources for accuracy
      const calculatedKPIs = await this.calculateKPIsFromData(employeeId, userId, periodStart, periodEnd, currentPeriod);
      
      // Use calculated KPIs as primary source (they're always accurate from actual data)
      // Only use database KPIs for targets if they exist
      const currentKPIs = calculatedKPIs.map(calculated => {
        const dbKPI = databaseKPIs.find(db => db.type === calculated.type);
        return {
          id: calculated.id,
          employeeId: calculated.employeeId,
          type: calculated.type,
          value: calculated.value, // Always use calculated value for accuracy - ignore database values
          target: dbKPI?.target || null, // Keep target from database if it exists
          period: calculated.period,
          date: calculated.date
        };
      });

      // Get historical KPIs for trends (last 6 months)
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      let historicalKPIs = await prisma.employeeKPI.findMany({
        where: {
          employeeId,
          date: {
            gte: sixMonthsAgo
          }
        },
        orderBy: { date: 'asc' }
      });

      // Calculate historical KPIs for missing periods (last 6 months)
      const historicalPeriods: string[] = [];
      for (let i = 1; i <= 6; i++) {
        const histDate = new Date(now);
        histDate.setMonth(histDate.getMonth() - i);
        const histPeriod = `${histDate.toLocaleString('default', { month: 'short' })} ${histDate.getFullYear()}`;
        if (histPeriod !== currentPeriod) {
          historicalPeriods.push(histPeriod);
        }
      }

      // Calculate KPIs for each historical period that doesn't have data
      for (const histPeriod of historicalPeriods) {
        const histParts = histPeriod.split(' ');
        const histMonthName = histParts[0];
        const histYear = parseInt(histParts[1]);
        const histMonthIndex = new Date(`${histMonthName} 1, ${histYear}`).getMonth();
        const histPeriodStart = new Date(histYear, histMonthIndex, 1);
        const histPeriodEnd = new Date(histYear, histMonthIndex + 1, 0, 23, 59, 59, 999);

        // Check if we already have KPIs for this period
        const hasKPIsForPeriod = historicalKPIs.some(h => h.period === histPeriod);
        
        if (!hasKPIsForPeriod) {
          const histKPIs = await this.calculateKPIsFromData(employeeId, userId, histPeriodStart, histPeriodEnd, histPeriod);
          historicalKPIs.push(...histKPIs);
        }
      }

      // Calculate trends and statistics
      const kpiTypes = Object.values(KPIType);
      const kpiData: any = {};
      
      for (const type of kpiTypes) {
        const current = currentKPIs.find(k => k.type === type);
        const historical = historicalKPIs.filter(k => k.type === type);
        
        // Calculate average for last 6 months
        const avgValue = historical.length > 0
          ? historical.reduce((sum, k) => sum + k.value, 0) / historical.length
          : 0;
        
        // Calculate trend (current vs average)
        const trend = current && avgValue > 0
          ? ((current.value - avgValue) / avgValue) * 100
          : 0;

        kpiData[type] = {
          current: current || null,
          historical: historical,
          average: avgValue,
          trend: trend,
          totalValue: historical.reduce((sum, k) => sum + k.value, 0),
          count: historical.length
        };
      }

      // Get period list for selector
      const periods = await prisma.employeeKPI.findMany({
        where: { employeeId },
        select: { period: true },
        distinct: ['period'],
        orderBy: { period: 'desc' },
        take: 12
      });

      // Calculate overall performance score
      const overallScore = this.calculateOverallScore(currentKPIs);

      // Get achievements/badges
      const achievements = this.calculateAchievements(historicalKPIs, currentKPIs);

      return {
        currentPeriod,
        kpis: currentKPIs,
        kpiData,
        overallScore,
        achievements,
        availablePeriods: periods.map(p => p.period),
        trends: this.calculateTrends(historicalKPIs)
      };
    } catch (error) {
      logger.error("Error fetching performance data:", error);
      throw error;
    }
  },

  calculateOverallScore(kpis: any[]): number {
    if (kpis.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;

    kpis.forEach(kpi => {
      if (kpi.target && kpi.target > 0) {
        const achievement = Math.min((kpi.value / kpi.target) * 100, 100);
        const weight = this.getKPIWeight(kpi.type);
        totalScore += achievement * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  },

  getKPIWeight(type: KPIType): number {
    const weights: Record<KPIType, number> = {
      LEADS_GENERATED: 1.0,
      DEMOS_COMPLETED: 1.2,
      SCHOOLS_ONBOARDED: 1.5,
      TICKETS_RESOLVED: 1.0,
      SALES_REVENUE: 1.3,
    };
    return weights[type] || 1.0;
  },

  calculateAchievements(historical: any[], current: any[]): any[] {
    const achievements: any[] = [];

    // Check for consistent performer (3+ months of meeting targets)
    const recentMonths = this.groupByPeriod(historical).slice(0, 3);
    const consistentCount = recentMonths.filter(month => {
      return month.kpis.every((k: any) => k.target && k.value >= k.target);
    }).length;
    
    if (consistentCount >= 3) {
      achievements.push({
        type: 'CONSISTENT',
        label: 'Consistent Performer',
        icon: 'Star',
        color: 'text-indigo-500',
        description: 'Met all targets for 3+ consecutive months'
      });
    }

    // Check for speedster (high completion rate)
    const demosKPI = current.find(k => k.type === KPIType.DEMOS_COMPLETED);
    if (demosKPI && demosKPI.target && demosKPI.value >= demosKPI.target * 1.2) {
      achievements.push({
        type: 'SPEEDSTER',
        label: 'Speedster',
        icon: 'Zap',
        color: 'text-amber-500',
        description: 'Exceeded demo targets by 20%+'
      });
    }

    // Check for closer (high conversion)
    const leadsKPI = current.find(k => k.type === KPIType.LEADS_GENERATED);
    const demosKPI2 = current.find(k => k.type === KPIType.DEMOS_COMPLETED);
    if (leadsKPI && demosKPI2 && leadsKPI.value > 0) {
      const conversionRate = (demosKPI2.value / leadsKPI.value) * 100;
      if (conversionRate >= 50) {
        achievements.push({
          type: 'CLOSER',
          label: 'Closer',
          icon: 'Target',
          color: 'text-red-500',
          description: '50%+ lead to demo conversion rate'
        });
      }
    }

    // Check for top performer (overall score > 90)
    const overallScore = this.calculateOverallScore(current);
    if (overallScore >= 90) {
      achievements.push({
        type: 'TOP_PERFORMER',
        label: 'Elite Performer',
        icon: 'Award',
        color: 'text-emerald-500',
        description: 'Overall performance score above 90%'
      });
    }

    return achievements;
  },

  groupByPeriod(kpis: any[]): any[] {
    const grouped: Record<string, any[]> = {};
    
    kpis.forEach(kpi => {
      if (!grouped[kpi.period]) {
        grouped[kpi.period] = [];
      }
      grouped[kpi.period].push(kpi);
    });

    return Object.entries(grouped)
      .map(([period, kpis]) => ({ period, kpis }))
      .sort((a, b) => a.period.localeCompare(b.period));
  },

  calculateTrends(historical: any[]): any {
    const trends: any = {};
    const grouped = this.groupByPeriod(historical);
    
    Object.values(KPIType).forEach(type => {
      const monthlyData = grouped.map(month => {
        const kpi = month.kpis.find((k: any) => k.type === type);
        return {
          period: month.period,
          value: kpi?.value || 0,
          target: kpi?.target || 0
        };
      });
      
      trends[type] = monthlyData;
    });

    return trends;
  },

  async calculateKPIsFromData(employeeId: string, userId: string, periodStart: Date, periodEnd: Date, period: string): Promise<any[]> {
    const kpis: any[] = [];

    try {
      // Debug logging
      logger.info(`Calculating KPIs for employee ${employeeId}, period: ${period}, range: ${periodStart.toISOString()} to ${periodEnd.toISOString()}`);
      // 1. TICKETS_RESOLVED - Count tickets resolved by this employee in the period
      const resolvedTickets = await prisma.ticket.count({
        where: {
          OR: [
            { employeeId: employeeId },
            { assignedToId: userId }
          ],
          status: 'RESOLVED',
          // Count tickets that were resolved (status changed to RESOLVED) in this period
          updatedAt: {
            gte: periodStart,
            lte: periodEnd
          }
        }
      });

      logger.info(`Tickets resolved: ${resolvedTickets} for employee ${employeeId} in period ${period}`);

      kpis.push({
        id: `calc-${KPIType.TICKETS_RESOLVED}`,
        employeeId,
        type: KPIType.TICKETS_RESOLVED,
        value: resolvedTickets,
        target: null,
        period,
        date: new Date()
      });

      // 2. DEMOS_COMPLETED - Count demos completed by this employee in the period
      // Count demos that were scheduled in the period OR updated to COMPLETED in the period
      const completedDemos = await prisma.demo.count({
        where: {
          AND: [
            {
              OR: [
                { conductedById: userId },
                { userId: userId }
              ]
            },
            {
              status: 'COMPLETED'
            },
            {
              OR: [
                {
                  scheduledAt: {
                    gte: periodStart,
                    lte: periodEnd
                  }
                },
                {
                  updatedAt: {
                    gte: periodStart,
                    lte: periodEnd
                  }
                }
              ]
            }
          ]
        }
      });

      logger.info(`Demos completed: ${completedDemos} for employee ${employeeId} in period ${period}`);

      kpis.push({
        id: `calc-${KPIType.DEMOS_COMPLETED}`,
        employeeId,
        type: KPIType.DEMOS_COMPLETED,
        value: completedDemos,
        target: null,
        period,
        date: new Date()
      });

      // 3. SCHOOLS_ONBOARDED - Count schools onboarded by this employee in the period
      const onboardedSchools = await prisma.schoolOnboarding.count({
        where: {
          assignedToId: userId,
          status: 'COMPLETED',
          // Count onboardings that were completed in this period
          updatedAt: {
            gte: periodStart,
            lte: periodEnd
          }
        }
      });

      logger.info(`Schools onboarded: ${onboardedSchools} for employee ${employeeId} in period ${period}`);

      kpis.push({
        id: `calc-${KPIType.SCHOOLS_ONBOARDED}`,
        employeeId,
        type: KPIType.SCHOOLS_ONBOARDED,
        value: onboardedSchools,
        target: null,
        period,
        date: new Date()
      });

      // 4. LEADS_GENERATED - Count leads generated/assigned to this employee
      // Count ONLY leads assigned to this employee that were CREATED in the period
      const leadCount = await prisma.lead.count({
        where: {
          assignedToId: userId,
          createdAt: {
            gte: periodStart,
            lte: periodEnd
          }
        }
      });

      // Debug: Also check total leads assigned to this employee
      const totalLeads = await prisma.lead.count({
        where: { assignedToId: userId }
      });

      logger.info(`Leads generated: ${leadCount} (total assigned: ${totalLeads}) for employee ${employeeId} in period ${period} (${periodStart.toISOString()} to ${periodEnd.toISOString()})`);

      kpis.push({
        id: `calc-${KPIType.LEADS_GENERATED}`,
        employeeId,
        type: KPIType.LEADS_GENERATED,
        value: leadCount,
        target: null,
        period,
        date: new Date()
      });

      // 5. SALES_REVENUE - Calculate revenue from converted leads/schools
      // This is a simplified calculation - you might want to link to actual payment/subscription data
      const convertedLeads = await prisma.lead.count({
        where: {
          assignedToId: userId,
          status: 'CONVERTED',
          updatedAt: {
            gte: periodStart,
            lte: periodEnd
          }
        }
      });

      // Estimate revenue (you may want to link to actual subscription/payment data)
      const estimatedRevenue = convertedLeads * 50000; // Example: 50k per converted lead

      logger.info(`Sales revenue: ${estimatedRevenue} (from ${convertedLeads} converted leads) for employee ${employeeId} in period ${period}`);

      kpis.push({
        id: `calc-${KPIType.SALES_REVENUE}`,
        employeeId,
        type: KPIType.SALES_REVENUE,
        value: estimatedRevenue,
        target: null,
        period,
        date: new Date()
      });

    } catch (error) {
      logger.error("Error calculating KPIs from data:", error);
    }

    return kpis;
  },

  async createOrUpdateKPI(employeeId: string, data: {
    type: KPIType;
    value: number;
    target?: number;
    period?: string;
  }) {
    try {
      const now = new Date();
      const period = data.period || `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
      
      // Check if KPI exists for this period
      const existing = await prisma.employeeKPI.findFirst({
        where: {
          employeeId,
          type: data.type,
          period: period
        }
      });

      if (existing) {
        // Update existing
        return await prisma.employeeKPI.update({
          where: { id: existing.id },
          data: {
            value: data.value,
            target: data.target,
            date: new Date()
          }
        });
      } else {
        // Create new
        return await prisma.employeeKPI.create({
          data: {
            employeeId,
            type: data.type,
            value: data.value,
            target: data.target,
            period: period,
            date: new Date()
          }
        });
      }
    } catch (error) {
      logger.error("Error creating/updating KPI:", error);
      throw error;
    }
  }
};

