/**
 * LateFeeService - Automatic Late Fee Calculation and Application
 *
 * Handles:
 * 1. Calculate late fees based on due date and payment date
 * 2. Tiered late fee structure (e.g., ₹50 for 0-7 days, ₹100 for 8-15 days)
 * 3. Automatic late fee head creation if payment is after due date
 * 4. Configurable late fee rules per school
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LedgerPostingService, LedgerEntry } from "./LedgerPostingService";

export interface LateFeeRule {
  daysFromDueDate: number; // 0-7, 8-15, etc.
  amount: number; // Fixed late fee amount
  percentage?: number; // Optional: percentage of outstanding amount
}

export interface LateFeeConfig {
  schoolId: string;
  academicYearId: string;
  enabled: boolean;
  rules: LateFeeRule[];
  feeHeadName?: string; // Default: "Late Fee"
  feeHeadId?: string; // If provided, use existing fee head
}

export interface LateFeeCalculation {
  daysLate: number;
  lateFeeAmount: number;
  applicableRule?: LateFeeRule;
}

export class LateFeeService {
  /**
   * Calculate late fee for a payment
   */
  static async calculateLateFee(
    schoolId: string,
    academicYearId: string,
    studentId: string,
    dueDate: Date,
    paymentDate: Date,
    outstandingAmount: number
  ): Promise<LateFeeCalculation> {
    const daysLate = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLate <= 0) {
      return {
        daysLate: 0,
        lateFeeAmount: 0,
      };
    }

    // Get late fee config for school (or use default)
    const config = await this.getLateFeeConfig(schoolId, academicYearId);

    if (!config.enabled) {
      return {
        daysLate,
        lateFeeAmount: 0,
      };
    }

    // Find applicable rule
    const applicableRule = config.rules
      .sort((a, b) => b.daysFromDueDate - a.daysFromDueDate)
      .find((rule) => daysLate >= rule.daysFromDueDate);

    if (!applicableRule) {
      return {
        daysLate,
        lateFeeAmount: 0,
      };
    }

    // Calculate late fee
    let lateFeeAmount = applicableRule.amount || 0;

    if (applicableRule.percentage) {
      const percentageAmount = (outstandingAmount * applicableRule.percentage) / 100;
      lateFeeAmount = Math.max(lateFeeAmount, percentageAmount);
    }

    return {
      daysLate,
      lateFeeAmount,
      applicableRule,
    };
  }

  /**
   * Apply late fee to a payment (create late fee demand if payment is late)
   */
  static async applyLateFee(
    schoolId: string,
    academicYearId: string,
    studentId: string,
    dueDate: Date,
    paymentDate: Date,
    outstandingAmount: number,
    createdBy: string
  ): Promise<{
    lateFeeAmount: number;
    lateFeeHeadId?: string;
    transactionGroupId?: string;
  }> {
    const calculation = await this.calculateLateFee(
      schoolId,
      academicYearId,
      studentId,
      dueDate,
      paymentDate,
      outstandingAmount
    );

    if (calculation.lateFeeAmount <= 0) {
      return { lateFeeAmount: 0 };
    }

    return await prisma.$transaction(
      async (tx) => {
        // Get or create late fee head
        const config = await this.getLateFeeConfig(schoolId, academicYearId);
        let lateFeeHeadId = config.feeHeadId;

        if (!lateFeeHeadId) {
          // Create late fee head if it doesn't exist
          const feeHead = await tx.feeHead.findFirst({
            where: {
              schoolId,
              name: config.feeHeadName || "Late Fee",
            },
          });

          if (feeHead) {
            lateFeeHeadId = feeHead.id;
          } else {
            // Create new late fee head
            const revenueAccount = await tx.account.findFirst({
              where: {
                schoolId,
                academicYearId,
                type: "INCOME",
                code: "LATE_FEE_REVENUE",
              },
            });

            if (!revenueAccount) {
              throw new Error("Late fee revenue account not found. Please seed system accounts.");
            }

            const newFeeHead = await tx.feeHead.create({
              data: {
                schoolId,
                name: config.feeHeadName || "Late Fee",
                revenueAccountId: revenueAccount.id,
                priority: 999, // Lowest priority
                isActive: true,
              },
            });

            lateFeeHeadId = newFeeHead.id;
          }
        }

        // Get system accounts
        const systemAccounts = await this.getSystemAccounts(tx, schoolId, academicYearId);

        // Get revenue account for late fee
        const lateFeeHead = await tx.feeHead.findUnique({
          where: { id: lateFeeHeadId },
          include: {
            revenueAccount: true,
          },
        });

        if (!lateFeeHead) {
          throw new Error("Late fee head not found");
        }

        // Create ledger entry: Debit STUDENT_RECEIVABLE, Credit LATE_FEE_REVENUE
        const ledgerEntries: LedgerEntry[] = [
          {
            debitAccountId: systemAccounts.STUDENT_RECEIVABLE,
            creditAccountId: lateFeeHead.revenueAccountId,
            amount: calculation.lateFeeAmount,
            studentId,
            description: `Late fee for ${calculation.daysLate} days overdue`,
          },
        ];

        const { transactionGroupId } = await LedgerPostingService.postLedgerEntries({
          schoolId,
          academicYearId,
          entries: ledgerEntries,
          transactionType: "DEMAND_GENERATION",
          referenceTable: "LateFee",
          createdBy,
          description: `Late fee: ${calculation.daysLate} days overdue`,
        }, tx);

        return {
          lateFeeAmount: calculation.lateFeeAmount,
          lateFeeHeadId,
          transactionGroupId,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /**
   * Get late fee configuration for a school
   */
  private static async getLateFeeConfig(schoolId: string, academicYearId: string): Promise<LateFeeConfig> {
    // For now, return default config
    // In production, this could be stored in a SchoolSettings table
    return {
      schoolId,
      academicYearId,
      enabled: true,
      rules: [
        { daysFromDueDate: 0, amount: 50 }, // ₹50 for 0-7 days
        { daysFromDueDate: 8, amount: 100 }, // ₹100 for 8-15 days
        { daysFromDueDate: 16, amount: 200 }, // ₹200 for 16+ days
      ],
      feeHeadName: "Late Fee",
    };
  }

  /**
   * Get system accounts
   */
  private static async getSystemAccounts(
    tx: Prisma.TransactionClient,
    schoolId: string,
    academicYearId: string
  ): Promise<{
    STUDENT_RECEIVABLE: string;
  }> {
    const account = await tx.account.findFirst({
      where: {
        schoolId,
        academicYearId,
        isSystem: true,
        code: "STUDENT_RECEIVABLE",
      },
    });

    if (!account) {
      throw new Error("STUDENT_RECEIVABLE account not found");
    }

    return {
      STUDENT_RECEIVABLE: account.id,
    };
  }
}
