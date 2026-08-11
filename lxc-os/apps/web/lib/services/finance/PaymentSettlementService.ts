import { PrismaClient, Prisma, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LedgerPostingService, LedgerEntry } from "./LedgerPostingService";
import { DashboardOptimizationService } from "./DashboardOptimizationService";
import { AccountService } from "./AccountService";

export interface OutstandingDue {
  feeHeadId: string;
  feeHeadName: string;
  priority: number;
  totalDue: number;
  paid: number;
  outstanding: number;
}

export interface PaymentSettlementRequest {
  schoolId: string;
  academicYearId: string;
  studentId: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentId: string; 
  createdBy: string;
  description?: string;
}

export interface SettlementResult {
  settledAmount: number;
  excessAmount: number; 
  settlements: Array<{
    feeHeadId: string;
    feeHeadName: string;
    amountSettled: number;
  }>;
  transactionGroupId: string;
}

export class PaymentSettlementService {
  /**
   * Settle payment against outstanding dues
   */
  static async settlePayment(
    request: PaymentSettlementRequest
  ): Promise<SettlementResult> {
    return await prisma.$transaction(
      async (tx) => {
        // Step 1: Get system accounts
        const systemAccountMap = await AccountService.getSystemAccounts(
          request.schoolId,
          request.academicYearId,
          ["STUDENT_RECEIVABLE", "CASH_IN_HAND", "BANK_ACCOUNT", "STUDENT_ADVANCE"],
          tx
        );
        const systemAccounts = {
          STUDENT_RECEIVABLE: systemAccountMap["STUDENT_RECEIVABLE"],
          CASH_IN_HAND: systemAccountMap["CASH_IN_HAND"],
          BANK_ACCOUNT: systemAccountMap["BANK_ACCOUNT"],
          STUDENT_ADVANCE: systemAccountMap["STUDENT_ADVANCE"],
        };

        // Step 2: Get outstanding dues ordered by priority
        const outstandingDues = await this.getOutstandingDues(
          tx,
          request.schoolId,
          request.academicYearId,
          request.studentId
        );

        // Step 3: Calculate settlement
        let remainingAmount = request.paymentAmount;
        const settlements: Array<{
          feeHeadId: string;
          feeHeadName: string;
          amountSettled: number;
        }> = [];

        for (const due of outstandingDues) {
          if (remainingAmount <= 0) break;

          const amountToSettle = Math.min(remainingAmount, due.outstanding);
          if (amountToSettle > 0) {
            settlements.push({
              feeHeadId: due.feeHeadId,
              feeHeadName: due.feeHeadName,
              amountSettled: amountToSettle,
            });
            remainingAmount -= amountToSettle;
          }
        }

        const settledAmount = request.paymentAmount - remainingAmount;
        const excessAmount = remainingAmount;

        // Step 4: Build ledger entries
        const ledgerEntries: LedgerEntry[] = [];

        const paymentAccountId =
          request.paymentMethod === "CASH"
            ? systemAccounts.CASH_IN_HAND
            : systemAccounts.BANK_ACCOUNT;

        if (settledAmount > 0) {
          ledgerEntries.push({
            debitAccountId: paymentAccountId,
            creditAccountId: systemAccounts.STUDENT_RECEIVABLE,
            amount: settledAmount,
            studentId: request.studentId,
            description: `Payment settlement: ${settlements.map((s) => s.feeHeadName).join(", ")}`,
          });
        }

        if (excessAmount > 0) {
          ledgerEntries.push({
            debitAccountId: paymentAccountId,
            creditAccountId: systemAccounts.STUDENT_ADVANCE,
            amount: excessAmount,
            studentId: request.studentId,
            description: `Excess payment to Student Advance`,
          });
        }

        // Step 5: Post ledger entries
        const { transactionGroupId } = await LedgerPostingService.postLedgerEntries(
          {
            schoolId: request.schoolId,
            academicYearId: request.academicYearId,
            entries: ledgerEntries,
            transactionType: "PAYMENT_COLLECTION",
            referenceTable: "Payment",
            referenceId: request.paymentId,
            createdBy: request.createdBy,
            description: request.description || `Payment settlement for student ${request.studentId}`,
          }, tx // Passing transaction text
        );

        return {
          settledAmount,
          excessAmount,
          settlements,
          transactionGroupId,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10000,
        timeout: 30000,
      }
    );
  }



  public static async getOutstandingDues(
    tx: Prisma.TransactionClient,
    schoolId: string,
    academicYearId: string,
    studentId: string
  ): Promise<OutstandingDue[]> {
    const feePlan = await tx.studentFeePlan.findFirst({
      where: {
        schoolId,
        academicYearId,
        studentId,
        isActive: true,
      },
      include: {
        feeHeadAmounts: {
          include: {
            feeHead: true,
          },
        },
      },
    });

    if (!feePlan) {
      return []; 
    }

    const payments = await tx.financeLedger.aggregate({
      where: {
        schoolId,
        academicYearId,
        studentId,
        creditAccount: { code: "STUDENT_RECEIVABLE" },
        transactionType: { in: ["PAYMENT_COLLECTION", "ADJUSTMENT", "CONCESSION", "CHEQUE_CLEARANCE"] as any },
      },
      _sum: { amount: true },
    });

    const reversals = await tx.financeLedger.aggregate({
      where: {
        schoolId,
        academicYearId,
        studentId,
        debitAccount: { code: "STUDENT_RECEIVABLE" },
        transactionType: "REVERSAL",
      },
      _sum: { amount: true },
    });

    let totalPaidPool = (payments._sum.amount || 0) - (reversals._sum.amount || 0);

    const demands = await tx.financeLedger.groupBy({
      by: ["creditAccountId"],
      where: {
        schoolId,
        academicYearId,
        studentId,
        transactionType: "DEMAND_GENERATION",
        referenceTable: "Demand",
      },
      _sum: { amount: true },
    });

    const demandMap = new Map(demands.map(d => [d.creditAccountId, d._sum.amount || 0]));

    const dues: OutstandingDue[] = [];

    for (const planHead of feePlan.feeHeadAmounts) {
      const feeHead = planHead.feeHead;
      const totalDemanded = demandMap.get(feeHead.revenueAccountId) || 0;

      if (totalDemanded > 0) {
        const settledForThisHead = Math.min(totalPaidPool, totalDemanded);
        const outstanding = totalDemanded - settledForThisHead;

        totalPaidPool -= settledForThisHead;

        if (outstanding > 0) {
          dues.push({
            feeHeadId: feeHead.id,
            feeHeadName: feeHead.name,
            priority: feeHead.priority,
            totalDue: totalDemanded,
            paid: settledForThisHead,
            outstanding: outstanding,
          });
        }
      }
    }

    return dues.sort((a, b) => a.priority - b.priority);
  }

  static async getStudentBalance(
    schoolId: string,
    academicYearId: string,
    studentId: string
  ): Promise<{
    receivable: number;
    advance: number;
    netBalance: number;
    collected: number;
  }> {
    const [srDebits, srCredits, saCredits, saDebits, actualPaymentsSR] = await Promise.all([
      prisma.financeLedger.aggregate({
        where: { schoolId, academicYearId, studentId, debitAccount: { code: "STUDENT_RECEIVABLE" } },
        _sum: { amount: true },
      }),
      prisma.financeLedger.aggregate({
        where: { schoolId, academicYearId, studentId, creditAccount: { code: "STUDENT_RECEIVABLE" } },
        _sum: { amount: true },
      }),
      prisma.financeLedger.aggregate({
        where: { schoolId, academicYearId, studentId, creditAccount: { code: "STUDENT_ADVANCE" } },
        _sum: { amount: true },
      }),
      prisma.financeLedger.aggregate({
        where: { schoolId, academicYearId, studentId, debitAccount: { code: "STUDENT_ADVANCE" } },
        _sum: { amount: true },
      }),
      prisma.financeLedger.aggregate({
        where: { 
          schoolId, 
          academicYearId, 
          studentId, 
          creditAccount: { code: "STUDENT_RECEIVABLE" },
          transactionType: { in: ["PAYMENT_COLLECTION", "CHEQUE_CLEARANCE"] as any }
        },
        _sum: { amount: true },
      }),
    ]);

    const netReceivable = Math.max(0, (srDebits._sum.amount || 0) - (srCredits._sum.amount || 0));
    const netAdvance = Math.max(0, (saCredits._sum.amount || 0) - (saDebits._sum.amount || 0));
    const netBalance = netReceivable - netAdvance;
    // collected only includes real payments + SA deposits (money entered the school)
    const collected = (actualPaymentsSR._sum.amount || 0) + (saCredits._sum.amount || 0);

    return {
      receivable: srDebits._sum.amount || 0,
      advance: netAdvance,
      netBalance,
      collected,
    };
  }

  static async getPayments(
    schoolId: string,
    academicYearId: string,
    filters?: { studentId?: string; startDate?: Date; endDate?: Date }
  ) {
    const where: Prisma.PaymentWhereInput = {
      schoolId,
      // academicYearId is not directly on Payment, usually filtered by date or linked via StudentFeePlan -> but Payment model doesn't link to AY directly.
      // Assuming filtering by date range of the AY or just by schoolId for now.
      // Ideally Payment should have academicYearId or be linked to it.
      // Creating a broad filter for now.
    };

    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.paymentDate = {};
      if (filters.startDate) where.paymentDate.gte = filters.startDate;
      if (filters.endDate) where.paymentDate.lte = filters.endDate;
    }

    return prisma.payment.findMany({
      where,
      include: {
        student: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
            admissionNo: true,
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });
  }

  static async getPaymentById(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            admissionNo: true,
            class: true,
          },
        },
        financeLedgerEntries: true, 
      },
    });
  }

  static async getCollections(
    schoolId: string,
    startDate: Date,
    endDate: Date,
    classId?: string,
    academicYearId?: string
  ) {
    // Ensure endDate includes the full day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const where: Prisma.PaymentWhereInput = {
      schoolId,
      paymentDate: {
        gte: startDate,
        lte: adjustedEndDate,
      },
      status: PaymentStatus.COMPLETED,
    };

    if (classId) {
      where.student = { is: { classId } };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          select: {
            user: { select: { name: true } },
            admissionNo: true,
            class: { select: { name: true } },
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate pending dues for the selected context
    let pendingDues = 0;
    
    // We need an academicYearId to calculate pending dues accurately from the ledger
    // If not provided, we'll try to find the active one
    let targetAY = academicYearId;
    if (!targetAY) {
      const activeAY = await prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
        select: { id: true }
      });
      targetAY = activeAY?.id;
    }

    if (targetAY) {
      const students = await prisma.student.findMany({
        where: { 
          schoolId, 
          status: "ACTIVE",
          classId: classId || undefined
        },
        select: { id: true }
      });
      
      const studentIds = students.map(s => s.id);
      if (studentIds.length > 0) {
        const balances = await DashboardOptimizationService.getAllStudentBalances(
          schoolId,
          targetAY,
          studentIds
        );
        
        const summary = DashboardOptimizationService.getSummaryFromBalances(balances);
        pendingDues = summary.totalOutstanding;
      }
    }

    return { total, payments, pendingDues };
  }

  /**
   * High-level helper to record a payment and immediately settle it
   * against the student's outstanding dues.
   */
  static async collectPayment(params: {
    schoolId: string;
    academicYearId: string;
    studentId: string;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    bankName?: string;
    branchName?: string;
    chequeDate?: Date;
    description?: string;
    collectedBy: string;
  }) {
    // Create Payment record for this collection (offline / direct payment)
    const payment = await prisma.payment.create({
      data: {
        amount: params.amount,
        status: PaymentStatus.COMPLETED,
        schoolId: params.schoolId,
        studentId: params.studentId,
        paymentMethod: params.paymentMethod,
        paymentDate: new Date(),
        failureReason: null,
        // Synthetic order id for non-Razorpay collections (required & unique)
        razorpayOrderId: `OFFLINE_${params.schoolId}_${Date.now()}`,
        description: params.description,
      },
    });

    // Settle this payment against outstanding dues
    await this.settlePayment({
      schoolId: params.schoolId,
      academicYearId: params.academicYearId,
      studentId: params.studentId,
      paymentAmount: params.amount,
      paymentMethod: params.paymentMethod,
      paymentId: payment.id,
      createdBy: params.collectedBy,
      description: params.description,
    });

    return payment;
  }
}
