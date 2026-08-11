/**
 * DashboardOptimizationService - Optimized Aggregations for Finance Dashboard
 *
 * Efficiently calculates:
 * 1. Student balances (receivable vs advance)
 * 2. Aging analysis
 * 3. Class-wise receivables
 * 4. Defaulters list
 */

import { prisma } from "@/lib/prisma";
import { FinanceTransactionType } from "@prisma/client";

export interface StudentBalanceSummary {
  studentId: string;
  receivable: number;
  advance: number;
  netBalance: number;
  collected: number;
}

export interface DashboardSummary {
  totalOutstanding: number;
  totalPaid: number;
  totalDemand: number;
  defaultersCount: number;
  totalStudents: number;
  collectionRate: number;
}

export interface AgingBucket {
  name: string;
  amount: number;
}

export interface ClassReceivable {
  className: string;
  totalOutstanding: number;
  totalPaid: number;
  totalDemand: number;
  defaultersCount: number;
  totalStudents: number;
  collectionRate: number;
}

export class DashboardOptimizationService {
  static async getAllStudentBalances(
    schoolId: string,
    academicYearId: string,
    studentIds: string[],
  ): Promise<Map<string, StudentBalanceSummary>> {
    if (studentIds.length === 0) {
      return new Map();
    }

    // Get system accounts for this school/year
    const accounts = await prisma.account.findMany({
      where: {
        schoolId,
        academicYearId,
        code: { in: ["STUDENT_RECEIVABLE", "STUDENT_ADVANCE"] },
      },
      select: { id: true, code: true },
    });

    const srAccount = accounts.find((a) => a.code === "STUDENT_RECEIVABLE")?.id;
    const saAccount = accounts.find((a) => a.code === "STUDENT_ADVANCE")?.id;

    if (!srAccount || !saAccount) {
      console.error(
        `❌ Dashboard Optimization: Missing system accounts for ${schoolId}`,
      );
      return new Map();
    }

    // Fetch all relevant ledger aggregates in parallel
    // SR = STUDENT_RECEIVABLE, SA = STUDENT_ADVANCE
    const [demands, allCreditsSR, paymentsSR, advances, appliedAdvances] =
      await Promise.all([
        prisma.financeLedger.groupBy({
          by: ["studentId"],
          where: {
            schoolId,
            academicYearId,
            studentId: { in: studentIds },
            debitAccountId: srAccount,
          },
          _sum: { amount: true },
        }),
        prisma.financeLedger.groupBy({
          by: ["studentId"],
          where: {
            schoolId,
            academicYearId,
            studentId: { in: studentIds },
            creditAccountId: srAccount,
          },
          _sum: { amount: true },
        }),
        prisma.financeLedger.groupBy({
          by: ["studentId"],
          where: {
            schoolId,
            academicYearId,
            studentId: { in: studentIds },
            creditAccountId: srAccount,
            // Only count actual payments as "Collected"
            transactionType: {
              in: [
                FinanceTransactionType.PAYMENT_COLLECTION,
                FinanceTransactionType.CHEQUE_CLEARANCE,
              ],
            },
          },
          _sum: { amount: true },
        }),
        prisma.financeLedger.groupBy({
          by: ["studentId"],
          where: {
            schoolId,
            academicYearId,
            studentId: { in: studentIds },
            creditAccountId: saAccount,
          },
          _sum: { amount: true },
        }),
        prisma.financeLedger.groupBy({
          by: ["studentId"],
          where: {
            schoolId,
            academicYearId,
            studentId: { in: studentIds },
            debitAccountId: saAccount,
          },
          _sum: { amount: true },
        }),
      ]);

    const balanceMap = new Map<string, StudentBalanceSummary>();

    // Initialize map
    studentIds.forEach((studentId) => {
      balanceMap.set(studentId, {
        studentId,
        receivable: 0, // Total Demanded
        advance: 0, // Current Advance Available
        netBalance: 0, // Pending to Pay
        collected: 0, // Total amount paid by student
      });
    });

    // Helper to get sum
    const getSum = (arr: any[], id: string) =>
      arr.find((r) => r.studentId === id)?._sum?.amount || 0;

    // Populate balances
    studentIds.forEach((studentId) => {
      const totalDemanded = getSum(demands, studentId);
      const totalCreditsSR = getSum(allCreditsSR, studentId);
      const actualPaymentsSR = getSum(paymentsSR, studentId);
      const totalReceivedSA = getSum(advances, studentId);
      const totalAppliedSA = getSum(appliedAdvances, studentId);

      // netBalance uses total credits (including concessions) to show what's actually owed
      const pendingReceivable = Math.max(0, totalDemanded - totalCreditsSR);
      const availableAdvance = Math.max(0, totalReceivedSA - totalAppliedSA);

      const studentData = balanceMap.get(studentId)!;
      studentData.receivable = totalDemanded;
      studentData.advance = availableAdvance;
      // Net balance is what is truly owed: pending dues minus available credit
      studentData.netBalance = pendingReceivable - availableAdvance;
      // collected only includes real payments + SA deposits (money entered the school)
      studentData.collected = actualPaymentsSR + totalReceivedSA;
    });

    // console.log(`📊 Dashboard optimization: Aggregated operations for ${studentIds.length} students.`);
    return balanceMap;
  }

  static getSummaryFromBalances(
    balances: Map<string, StudentBalanceSummary>,
  ): DashboardSummary {
    let totalOutstanding = 0;
    let totalPaid = 0;
    let totalDemand = 0;
    let defaultersCount = 0;

    balances.forEach((balance) => {
      totalOutstanding += balance.netBalance > 0 ? balance.netBalance : 0;
      totalPaid += balance.collected;
      totalDemand += balance.receivable;
      if (balance.netBalance > 0) {
        defaultersCount++;
      }
    });

    return {
      totalOutstanding,
      totalPaid,
      totalDemand,
      defaultersCount,
      totalStudents: balances.size,
      collectionRate: totalDemand > 0 ? (totalPaid / totalDemand) * 100 : 0,
    };
  }

  static async getAgingAnalysisOptimized(
    schoolId: string,
    academicYearId: string,
    balances: Map<string, StudentBalanceSummary>,
  ): Promise<AgingBucket[]> {
    const agingBuckets: AgingBucket[] = [
      { name: "0-30 days", amount: 0 },
      { name: "31-60 days", amount: 0 },
      { name: "61-90 days", amount: 0 },
      { name: "90+ days", amount: 0 },
    ];

    const studentsWithDues = Array.from(balances.entries())
      .filter(([_, balance]) => balance.netBalance > 0)
      .map(([studentId, _]) => studentId);

    if (studentsWithDues.length === 0) {
      return agingBuckets;
    }

    // Use Prisma query instead of raw SQL to avoid column name issues
    // Get oldest demand for each student with dues
    const oldestDemands = await prisma.financeLedger.findMany({
      where: {
        schoolId,
        academicYearId,
        studentId: { in: studentsWithDues },
        transactionType: FinanceTransactionType.DEMAND_GENERATION,
        debitAccount: {
          code: "STUDENT_RECEIVABLE",
        },
      },
      select: {
        studentId: true,
        createdAt: true,
        description: true,
      },
      orderBy: [{ studentId: "asc" }, { createdAt: "asc" }],
    });

    // Group by studentId and get the first (oldest) demand for each student
    const studentDemandMap = new Map<
      string,
      { studentId: string; createdAt: Date; description: string | null }
    >();
    oldestDemands.forEach((demand) => {
      if (demand.studentId && !studentDemandMap.has(demand.studentId)) {
        studentDemandMap.set(demand.studentId, {
          studentId: demand.studentId,
          createdAt: demand.createdAt,
          description: demand.description,
        });
      }
    });

    const validDemands = Array.from(studentDemandMap.values());

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    validDemands.forEach((demand) => {
      const balance = balances.get(demand.studentId);
      if (!balance || balance.netBalance <= 0) return;

      let dueDate: Date;
      const dueDateMatch = demand.description?.match(
        /Due:\s*(\d{4}-\d{2}-\d{2})/,
      );
      if (dueDateMatch) {
        dueDate = new Date(dueDateMatch[1]);
      } else {
        dueDate = new Date(demand.createdAt);
        dueDate.setDate(dueDate.getDate() + 10);
      }

      dueDate.setHours(0, 0, 0, 0);
      const daysOverdue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysOverdue <= 30) {
        agingBuckets[0].amount += balance.netBalance;
      } else if (daysOverdue <= 60) {
        agingBuckets[1].amount += balance.netBalance;
      } else if (daysOverdue <= 90) {
        agingBuckets[2].amount += balance.netBalance;
      } else {
        agingBuckets[3].amount += balance.netBalance;
      }
    });

    return agingBuckets;
  }

  static async getClassReceivablesOptimized(
    schoolId: string,
    balances: Map<string, StudentBalanceSummary>,
    studentIdToClassMap: Map<string, { id: string; name: string }>,
  ): Promise<ClassReceivable[]> {
    const classSummaries = new Map<
      string,
      {
        className: string;
        totalOutstanding: number;
        totalPaid: number;
        totalDemand: number;
        defaultersCount: number;
        totalStudents: number;
      }
    >();

    balances.forEach((balance, studentId) => {
      const classInfo = studentIdToClassMap.get(studentId);
      if (!classInfo) return;

      let summary = classSummaries.get(classInfo.id);
      if (!summary) {
        summary = {
          className: classInfo.name,
          totalOutstanding: 0,
          totalPaid: 0,
          totalDemand: 0,
          defaultersCount: 0,
          totalStudents: 0,
        };
        classSummaries.set(classInfo.id, summary);
      }

      summary.totalStudents++;
      summary.totalDemand += balance.receivable;
      summary.totalOutstanding +=
        balance.netBalance > 0 ? balance.netBalance : 0;
      summary.totalPaid += balance.collected;

      if (balance.netBalance > 0) {
        summary.defaultersCount++;
      }
    });

    return Array.from(classSummaries.values()).map((summary) => ({
      ...summary,
      collectionRate:
        summary.totalDemand > 0
          ? (summary.totalPaid / summary.totalDemand) * 100
          : 0,
    }));
  }

  static async getDefaultersList(
    schoolId: string,
    balances: Map<string, StudentBalanceSummary>,
    limit: number = 50,
  ): Promise<
    Array<{
      studentId: string;
      studentName: string;
      admissionNo: string;
      className: string;
      outstandingAmount: number;
    }>
  > {
    const defaulterIds = Array.from(balances.entries())
      .filter(([_, balance]) => balance.netBalance > 0)
      .sort(([_, a], [__, b]) => b.netBalance - a.netBalance)
      .slice(0, limit)
      .map(([studentId, _]) => studentId);

    if (defaulterIds.length === 0) {
      return [];
    }

    const students = await prisma.student.findMany({
      where: {
        id: { in: defaulterIds },
        schoolId,
      },
      include: {
        user: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    return students.map((student) => {
      const balance = balances.get(student.id);
      return {
        studentId: student.id,
        studentName: student.user?.name || "Unknown",
        admissionNo: student.admissionNo || "",
        className: student.class?.name || "N/A",
        outstandingAmount: balance?.netBalance || 0,
      };
    });
  }
}
