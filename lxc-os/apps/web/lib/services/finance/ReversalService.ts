/**
 * ReversalService - Payment Reversal and Transaction Voiding
 *
 * Handles:
 * 1. Void a payment transaction
 * 2. Restore student's outstanding balance
 * 3. Reverse ledger entries atomically
 * 4. Maintain audit trail
 */

import { PrismaClient, Prisma, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LedgerPostingService, LedgerEntry } from "./LedgerPostingService";
import { PaymentSettlementService } from "./PaymentSettlementService";

export interface ReversalRequest {
  schoolId: string;
  academicYearId: string;
  paymentId: string;
  reason: string;
  createdBy: string;
}

export interface ReversalResult {
  reversalId: string;
  transactionGroupId: string;
  reversedAmount: number;
  restoredBalance: number;
}

export class ReversalService {
  /**
   * Reverse a payment transaction
   */
  static async reversePayment(
    request: ReversalRequest,
  ): Promise<ReversalResult> {
    return await prisma.$transaction(
      async (tx) => {
        // Get payment
        const payment = await tx.payment.findUnique({
          where: { id: request.paymentId },
          include: {
            financeLedgerEntries: {
              include: {
                debitAccount: true,
                creditAccount: true,
              },
            },
          },
        });

        if (!payment) {
          throw new Error("Payment not found");
        }

        if (payment.schoolId !== request.schoolId) {
          throw new Error("Payment does not belong to this school");
        }

        // Check if already reversed
        const existingReversal = await tx.financeLedger.findFirst({
          where: {
            schoolId: request.schoolId,
            transactionType: "REVERSAL",
            referenceTable: "Payment",
            referenceId: request.paymentId,
          },
        });

        if (existingReversal) {
          throw new Error("Payment has already been reversed");
        }

        // Get system accounts (verification only, accounts must exist)
        await this.getSystemAccounts(
          tx,
          request.schoolId,
          request.academicYearId,
        );

        // Build reverse ledger entries
        const reverseEntries: LedgerEntry[] = [];
        let sourceEntries = payment.financeLedgerEntries;

        // Fallback: If no relation-linked entries, search by referenceId
        if (sourceEntries.length === 0) {
          sourceEntries = (await tx.financeLedger.findMany({
            where: {
              schoolId: request.schoolId,
              referenceTable: "Payment",
              referenceId: request.paymentId,
            },
          })) as any;
        }

        if (sourceEntries.length === 0) {
          throw new Error(
            "No ledger entries found to reverse for this payment. It might be an old payment not tracked by the finance engine.",
          );
        }

        // Use original academic year from first entry to ensure accounts are found
        const originalAcademicYearId = sourceEntries[0].academicYearId;

        for (const ledgerEntry of sourceEntries) {
          // Reverse: swap debit and credit
          reverseEntries.push({
            debitAccountId: ledgerEntry.creditAccountId,
            creditAccountId: ledgerEntry.debitAccountId,
            amount: ledgerEntry.amount,
            studentId: ledgerEntry.studentId || undefined,
            description: `Reversal: ${ledgerEntry.description || "Payment reversal"}`,
          });
        }

        // Post reversal entries
        const { transactionGroupId } =
          await LedgerPostingService.postLedgerEntries(
            {
              schoolId: request.schoolId,
              academicYearId: originalAcademicYearId, // CRITICAL: Use original year
              entries: reverseEntries,
              transactionType: "REVERSAL",
              referenceTable: "Payment",
              referenceId: request.paymentId,
              createdBy: request.createdBy,
              description: `Payment reversal: ${request.reason}`,
            },
            tx,
          ); // PASS THE TRANSACTION CLIENT

        // Update payment status
        await tx.payment.update({
          where: { id: request.paymentId },
          data: {
            status: PaymentStatus.REFUNDED,
            description: `${payment.description || ""} [REVERSED: ${request.reason}]`,
          },
        });

        // Calculate restored balance
        let restoredBalance = 0;
        if (payment.studentId) {
          const balance = await PaymentSettlementService.getStudentBalance(
            request.schoolId,
            originalAcademicYearId, // Use original year for balance check
            payment.studentId,
          );
          restoredBalance = balance.netBalance;
        }

        return {
          reversalId: transactionGroupId,
          transactionGroupId,
          reversedAmount: payment.amount,
          restoredBalance,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        maxWait: 15000,
        timeout: 60000,
      },
    );
  }

  /**
   * Get reversal history for a payment
   */
  static async getReversalHistory(paymentId: string) {
    return await prisma.financeLedger.findMany({
      where: {
        transactionType: "REVERSAL",
        referenceTable: "Payment",
        referenceId: paymentId,
      },
      include: {
        debitAccount: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        creditAccount: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get system accounts
   */
  private static async getSystemAccounts(
    tx: Prisma.TransactionClient,
    schoolId: string,
    academicYearId: string,
  ): Promise<{
    STUDENT_RECEIVABLE: string;
    CASH_IN_HAND: string;
    BANK_ACCOUNT: string;
    STUDENT_ADVANCE: string;
  }> {
    const accounts = await tx.account.findMany({
      where: {
        schoolId,
        academicYearId,
        isSystem: true,
      },
      select: {
        id: true,
        code: true,
      },
    });

    const accountMap: Record<string, string> = {};
    accounts.forEach((acc) => {
      accountMap[acc.code] = acc.id;
    });

    const required = [
      "STUDENT_RECEIVABLE",
      "CASH_IN_HAND",
      "BANK_ACCOUNT",
      "STUDENT_ADVANCE",
    ];
    const missing = required.filter((code) => !accountMap[code]);

    if (missing.length > 0) {
      throw new Error(
        `Missing system accounts: ${missing.join(", ")}. Please seed system accounts first.`,
      );
    }

    return {
      STUDENT_RECEIVABLE: accountMap["STUDENT_RECEIVABLE"],
      CASH_IN_HAND: accountMap["CASH_IN_HAND"],
      BANK_ACCOUNT: accountMap["BANK_ACCOUNT"],
      STUDENT_ADVANCE: accountMap["STUDENT_ADVANCE"],
    };
  }
}
