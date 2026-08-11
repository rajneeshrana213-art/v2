/**
 * ConcessionService - Apply Concessions and Waivers
 *
 * Handles:
 * 1. Applying partial/fixed waivers to fee plans before demand generation
 * 2. Percentage-based concessions
 * 3. Full waivers
 * 4. Approval workflow for concessions
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LedgerPostingService } from "./LedgerPostingService";

export interface ConcessionRequest {
  schoolId: string;
  studentFeePlanId: string;
  feeHeadId?: string; // null = applies to all fee heads
  amount: number; // Fixed amount or percentage value
  type: "FIXED_AMOUNT" | "PERCENTAGE" | "FULL_WAIVER";
  reason: string;
  approvedBy?: string; // If provided, auto-approve
}

export interface ConcessionResult {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  effectiveAmount: number; // Calculated effective concession amount
}

export class ConcessionService {
  /**
   * Apply concession to a student's fee plan
   */
  static async applyConcession(request: ConcessionRequest): Promise<ConcessionResult> {
    return await prisma.$transaction(
      async (tx) => {
        // Validate student fee plan exists
        const feePlan = await tx.studentFeePlan.findUnique({
          where: { id: request.studentFeePlanId },
          include: {
            feeHeadAmounts: {
              include: {
                feeHead: true,
              },
            },
          },
        });

        if (!feePlan) {
          throw new Error("Student fee plan not found");
        }

        // Calculate effective concession amount
        let effectiveAmount = 0;

        if (request.type === "FULL_WAIVER") {
          // Calculate total fee amount
          if (request.feeHeadId) {
            const head = feePlan.feeHeadAmounts.find((h: any) => h.feeHeadId === request.feeHeadId);
            effectiveAmount = head?.amount || 0;
          } else {
            effectiveAmount = feePlan.feeHeadAmounts.reduce((sum: number, h: any) => sum + h.amount, 0);
          }
        } else if (request.type === "PERCENTAGE") {
          if (request.feeHeadId) {
            const head = feePlan.feeHeadAmounts.find((h: any) => h.feeHeadId === request.feeHeadId);
            effectiveAmount = ((head?.amount || 0) * request.amount) / 100;
          } else {
            const total = feePlan.feeHeadAmounts.reduce((sum: number, h: any) => sum + h.amount, 0);
            effectiveAmount = (total * request.amount) / 100;
          }
        } else {
          // FIXED_AMOUNT
          effectiveAmount = request.amount;
        }

        // Create concession
        const concession = await tx.concession.create({
          data: {
            schoolId: request.schoolId,
            studentFeePlanId: request.studentFeePlanId,
            feeHeadId: request.feeHeadId || null,
            amount: request.amount,
            type: request.type,
            reason: request.reason,
            status: request.approvedBy ? "APPROVED" : "PENDING",
            approvedBy: request.approvedBy || null,
            approvedAt: request.approvedBy ? new Date() : null,
          },
        });

        // If approved, post to ledger
        if (concession.status === "APPROVED" && effectiveAmount > 0) {
          const accounts = await tx.account.findMany({
            where: {
              schoolId: request.schoolId,
              academicYearId: feePlan.academicYearId,
              code: { in: ["CONCESSION_EXPENSE", "STUDENT_RECEIVABLE"] },
            },
            select: { id: true, code: true },
          });

          const expAccount = accounts.find((a) => a.code === "CONCESSION_EXPENSE")?.id;
          const recAccount = accounts.find((a) => a.code === "STUDENT_RECEIVABLE")?.id;

          if (expAccount && recAccount) {
            await LedgerPostingService.postLedgerEntries(
              {
                schoolId: request.schoolId,
                academicYearId: feePlan.academicYearId,
                transactionType: "CONCESSION",
                createdBy: request.approvedBy!,
                description: `Fee Concession: ${request.reason}`,
                referenceTable: "Concession",
                referenceId: concession.id,
                entries: [
                  {
                    debitAccountId: expAccount,
                    creditAccountId: recAccount,
                    amount: effectiveAmount,
                    studentId: feePlan.studentId,
                    description: `Concession reduction for ${feePlan.id}`,
                  },
                ],
              },
              tx
            );
          }
        }

        return {
          id: concession.id,
          status: concession.status,
          effectiveAmount,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /**
   * Approve a pending concession
   */
  static async approveConcession(concessionId: string, approvedBy: string): Promise<ConcessionResult> {
    return await prisma.$transaction(async (tx) => {
      const concession = await tx.concession.update({
        where: { id: concessionId },
        data: {
          status: "APPROVED",
          approvedBy,
          approvedAt: new Date(),
        },
        include: {
          studentFeePlan: {
            include: {
              feeHeadAmounts: {
                include: {
                  feeHead: true,
                },
              },
            },
          },
        },
      });

      // Calculate effective amount
      let effectiveAmount = 0;
      if (concession.type === "FULL_WAIVER") {
        if (concession.feeHeadId) {
          const head = concession.studentFeePlan.feeHeadAmounts.find((h: any) => h.feeHeadId === concession.feeHeadId);
          effectiveAmount = head?.amount || 0;
        } else {
          effectiveAmount = concession.studentFeePlan.feeHeadAmounts.reduce((sum: number, h: any) => sum + h.amount, 0);
        }
      } else if (concession.type === "PERCENTAGE") {
        if (concession.feeHeadId) {
          const head = concession.studentFeePlan.feeHeadAmounts.find((h: any) => h.feeHeadId === concession.feeHeadId);
          effectiveAmount = ((head?.amount || 0) * concession.amount) / 100;
        } else {
          const total = concession.studentFeePlan.feeHeadAmounts.reduce((sum: number, h: any) => sum + h.amount, 0);
          effectiveAmount = (total * concession.amount) / 100;
        }
      } else {
        effectiveAmount = concession.amount;
      }

      // Post to ledger
      if (effectiveAmount > 0) {
        const accounts = await tx.account.findMany({
          where: {
            schoolId: concession.schoolId,
            academicYearId: concession.studentFeePlan.academicYearId,
            code: { in: ["CONCESSION_EXPENSE", "STUDENT_RECEIVABLE"] },
          },
          select: { id: true, code: true },
        });

        const expAccount = accounts.find((a) => a.code === "CONCESSION_EXPENSE")?.id;
        const recAccount = accounts.find((a) => a.code === "STUDENT_RECEIVABLE")?.id;

        if (expAccount && recAccount) {
          await LedgerPostingService.postLedgerEntries(
            {
              schoolId: concession.schoolId,
              academicYearId: concession.studentFeePlan.academicYearId,
              transactionType: "CONCESSION",
              createdBy: approvedBy,
              description: `Fee Concession: ${concession.reason}`,
              referenceTable: "Concession",
              referenceId: concession.id,
              entries: [
                {
                  debitAccountId: expAccount,
                  creditAccountId: recAccount,
                  amount: effectiveAmount,
                  studentId: concession.studentFeePlan.studentId,
                  description: `Concession reduction for ${concession.studentFeePlanId}`,
                },
              ],
            },
            tx
          );
        }
      }

      return {
        id: concession.id,
        status: concession.status,
        effectiveAmount,
      };
    });
  }

  /**
   * Get concessions for a student fee plan
   */
  static async getConcessions(studentFeePlanId: string) {
    return await prisma.concession.findMany({
      where: { studentFeePlanId },
      include: {
        feeHead: {
          select: {
            id: true,
            name: true,
          },
        },
        approver: {
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
   * Calculate effective fee amount after concessions
   * This should be called before demand generation
   */
  static async calculateEffectiveFee(
    studentFeePlanId: string, 
    feeHeadId?: string,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    const client = tx || prisma;
    const feePlan = await client.studentFeePlan.findUnique({
      where: { id: studentFeePlanId },
      include: {
        feeHeadAmounts: {
          include: {
            feeHead: true,
          },
        },
        concessions: {
          where: {
            status: "APPROVED",
            OR: feeHeadId ? [{ feeHeadId }, { feeHeadId: null }] : [{ feeHeadId: null }],
          },
        },
      },
    });

    if (!feePlan) {
      throw new Error("Fee plan not found");
    }

    let totalFee = 0;

    if (feeHeadId) {
      const head = feePlan.feeHeadAmounts.find((h: any) => h.feeHeadId === feeHeadId);
      if (!head) return 0;
      totalFee = head.amount;
    } else {
      totalFee = feePlan.feeHeadAmounts.reduce((sum: number, h: any) => sum + h.amount, 0);
    }

    // Apply concessions
    for (const concession of feePlan.concessions) {
      if (concession.type === "FULL_WAIVER") {
        if (!concession.feeHeadId || concession.feeHeadId === feeHeadId) {
          totalFee = 0;
          break;
        }
      } else if (concession.type === "PERCENTAGE") {
        if (!concession.feeHeadId || concession.feeHeadId === feeHeadId) {
          totalFee -= (totalFee * concession.amount) / 100;
        }
      } else {
        // FIXED_AMOUNT
        if (!concession.feeHeadId || concession.feeHeadId === feeHeadId) {
          totalFee -= concession.amount;
        }
      }
    }

    return Math.max(0, totalFee);
  }
}
