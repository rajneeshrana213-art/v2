import { prisma } from "@/lib/prisma";

export class FinanceReportingService {
  /**
   * Get collection summary aggregated by Fee Head.
   * Two-step approach: first resolve account IDs, then aggregate.
   */
  static async getCollectionByHead(schoolId: string, academicYearId: string) {
    // ─── Step 1: Resolve system account IDs for this school + year ───
    const systemAccounts = await prisma.account.findMany({
      where: {
        schoolId,
        academicYearId,
        code: { in: ["STUDENT_RECEIVABLE", "STUDENT_ADVANCE"] },
        isSystem: true,
      },
      select: { id: true, code: true },
    });

    const receivableId = systemAccounts.find(a => a.code === "STUDENT_RECEIVABLE")?.id;
    const advanceId = systemAccounts.find(a => a.code === "STUDENT_ADVANCE")?.id;
    const paymentAccountIds = [receivableId, advanceId].filter(Boolean) as string[];

    // ─── Step 2: Total payments collected (Credit to RECEIVABLE or ADVANCE) ───
    let totalCollected = 0;
    if (paymentAccountIds.length > 0) {
      const collectedRes = await prisma.financeLedger.aggregate({
        where: {
          schoolId,
          academicYearId,
          creditAccountId: { in: paymentAccountIds },
          transactionType: { in: ["PAYMENT_COLLECTION", "CHEQUE_CLEARANCE"] as any },
        },
        _sum: { amount: true },
      });
      totalCollected = collectedRes._sum.amount || 0;

      // Subtract any reversals (Debit to RECEIVABLE or ADVANCE)
      const reversalsRes = await prisma.financeLedger.aggregate({
        where: {
          schoolId,
          academicYearId,
          debitAccountId: { in: paymentAccountIds },
          transactionType: "REVERSAL" as any,
        },
        _sum: { amount: true },
      });
      totalCollected -= reversalsRes._sum.amount || 0;
    }

    // ─── Step 3: Demands grouped by credit account (= revenue accounts) ───
    const demands = await prisma.financeLedger.groupBy({
      by: ["creditAccountId"],
      where: {
        schoolId,
        academicYearId,
        transactionType: "DEMAND_GENERATION" as any,
      },
      _sum: { amount: true },
    });

    const demandMap = new Map(
      demands.map((d) => [d.creditAccountId, d._sum.amount || 0])
    );

    // ─── Step 4: Fee heads with their revenue account IDs ───
    const feeHeads = await prisma.feeHead.findMany({
      where: { schoolId, isActive: true },
      include: { revenueAccount: { select: { id: true, name: true } } },
      orderBy: { priority: "asc" },
    });

    // ─── Step 5: Allocate collected pool by priority ───
    let remainingPool = totalCollected;
    const report: any[] = [];

    for (const head of feeHeads) {
      const demanded = demandMap.get(head.revenueAccountId) || 0;
      if (demanded === 0) continue; // Skip fee heads with no demand

      const settled = Math.min(demanded, remainingPool);
      report.push({
        headId: head.id,
        headName: head.name,
        demanded,
        collected: settled,
        outstanding: demanded - settled,
      });
      remainingPool -= settled;
    }

    const totalDemand = report.reduce((s, h) => s + h.demanded, 0);

    return {
      totalCollected,
      totalDemand,
      excessInAdvance: Math.max(0, remainingPool),
      headWise: report,
    };
  }

  /**
   * Monthly collection trend for the current calendar year using ledger data.
   */
  static async getMonthlyTrend(schoolId: string, academicYearId: string) {
    const receivableAcc = await prisma.account.findFirst({
      where: { schoolId, academicYearId, code: "STUDENT_RECEIVABLE", isSystem: true },
      select: { id: true },
    });
    const advanceAcc = await prisma.account.findFirst({
      where: { schoolId, academicYearId, code: "STUDENT_ADVANCE", isSystem: true },
      select: { id: true },
    });
    
    const validIds = [receivableAcc?.id, advanceAcc?.id].filter(Boolean) as string[];

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const trend = months.map((m) => ({ month: m, amount: 0 }));

    if (validIds.length === 0) return trend;

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const entries = await prisma.financeLedger.findMany({
      where: {
        schoolId,
        academicYearId,
        creditAccountId: { in: validIds },
        transactionType: { in: ["PAYMENT_COLLECTION", "CHEQUE_CLEARANCE"] as any },
        createdAt: { gte: startOfYear },
      },
      select: { amount: true, createdAt: true },
    });

    entries.forEach((e) => {
      const idx = new Date(e.createdAt).getMonth();
      trend[idx].amount += e.amount;
    });

    return trend;
  }
}
