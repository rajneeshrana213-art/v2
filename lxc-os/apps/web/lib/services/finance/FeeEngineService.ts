import { BillingType, FeeFrequency, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ConcessionService } from "./ConcessionService";
import * as fcmTriggers from "@/lib/services/notification/fcm-trigger-service";

export interface InstallmentSchedule {
  month: number;
  year: number;
  amount: number;
  dueDate: Date;
}

export class FeeEngineService {
  /**
   * Generates an installment schedule based on annual amount and frequency.
   */
  static generateInstallmentSchedule(
    annualAmount: number,
    frequency: FeeFrequency,
    academicYearStart: Date,
    academicYearEnd: Date,
  ): InstallmentSchedule[] {
    const installments: InstallmentSchedule[] = [];
    const startMonth = academicYearStart.getMonth(); // 0-indexed
    const startYear = academicYearStart.getFullYear();

    let count = 0;
    let interval = 0;

    switch (frequency) {
      case FeeFrequency.MONTHLY:
        count = 12;
        interval = 1;
        break;
      case FeeFrequency.QUARTERLY:
        count = 4;
        interval = 3;
        break;
      case FeeFrequency.HALF_YEARLY:
        count = 2;
        interval = 6;
        break;
      case FeeFrequency.YEARLY:
        count = 1;
        interval = 12;
        break;
      default:
        // For CUSTOM, we might need a different logic, defaulting to MONTHLY for now
        count = 12;
        interval = 1;
    }

    const installmentAmount = annualAmount / count;

    for (let i = 0; i < count; i++) {
      const date = new Date(startYear, startMonth + i * interval, 1);

      // Ensure the installment is within the academic year
      if (date <= academicYearEnd) {
        installments.push({
          month: date.getMonth() + 1, // 1-indexed for DB
          year: date.getFullYear(),
          amount: parseFloat(installmentAmount.toFixed(2)),
          dueDate: new Date(date.getFullYear(), date.getMonth(), 10), // Default due day is 10th
        });
      }
    }

    return installments;
  }

  /**
   * Applies proration for students joining mid-year.
   */
  static applyProration(
    installments: InstallmentSchedule[],
    admissionDate: Date,
  ): InstallmentSchedule[] {
    // Only return installments whose due date or billing month is >= admission date's month/year
    const admissionMonth = admissionDate.getMonth() + 1;
    const admissionYear = admissionDate.getFullYear();

    return installments.filter((inst) => {
      if (inst.year > admissionYear) return true;
      if (inst.year === admissionYear && inst.month >= admissionMonth)
        return true;
      return false;
    });
  }

  /**
   * Generates StudentInvoiceItem records for a student based on their fee structure.
   */
  static async syncStudentFeePlan(
    studentId: string,
    academicYearId: string,
    schoolId: string,
    tx: Prisma.TransactionClient,
  ) {
    // 1. Get the student's fee plan
    const plan = await tx.studentFeePlan.findUnique({
      where: {
        schoolId_academicYearId_studentId: {
          schoolId,
          academicYearId,
          studentId,
        },
      },
      include: {
        feeHeadAmounts: {
          include: { feeHead: true },
        },
        student: true,
        academicYear: true,
      },
    });

    if (!plan) return;
    const admissionDate = new Date(plan.student.admissionDate);

    // 2. Fetch all existing invoice items for this student and year to avoid N+1 queries
    const existingItems = await tx.studentInvoiceItem.findMany({
      where: {
        studentId,
        academicYearId,
        schoolId,
      },
    });

    const itemsToCreate: any[] = [];

    for (const headAmount of plan.feeHeadAmounts) {
      const feeHead = headAmount.feeHead;

      // Calculate the net amount for this specific head after concessions
      const netAmountForHead = await ConcessionService.calculateEffectiveFee(
        plan.id,
        feeHead.id,
        tx,
      );

      const headTotal = headAmount.amount;
      const concessionAmountTotal = headTotal - netAmountForHead;

      if (feeHead.type === BillingType.ONE_TIME) {
        // Check if OT item already exists
        const otId = `OT_${plan.id}_${feeHead.id}`;
        const exists = existingItems.find((ei) => ei.id === otId);

        if (!exists) {
          itemsToCreate.push({
            id: otId,
            schoolId,
            academicYearId,
            studentId,
            feeHeadId: feeHead.id,
            grossAmount: headTotal,
            concessionAmount: concessionAmountTotal,
            netAmount: netAmountForHead,
            balanceAmount: netAmountForHead,
            status: "UNPAID",
          });
        } else {
          // Update if needed (standard sequential update for now as it's rare)
          await tx.studentInvoiceItem.update({
            where: { id: otId },
            data: {
              grossAmount: headTotal,
              concessionAmount: concessionAmountTotal,
              netAmount: netAmountForHead,
              balanceAmount: netAmountForHead - (exists.paidAmount || 0),
            },
          });
        }
      } else {
        // RECURRING: Generate installments
        let schedule = this.generateInstallmentSchedule(
          headAmount.amount,
          feeHead.frequency,
          plan.academicYear.startDate,
          plan.academicYear.endDate,
        );

        // Apply proration
        schedule = this.applyProration(schedule, admissionDate);

        for (const inst of schedule) {
          // Check if invoice item already exists for this month/year/head
          const exists = existingItems.find(
            (ei) =>
              ei.feeHeadId === feeHead.id &&
              ei.month === inst.month &&
              ei.year === inst.year,
          );

          if (!exists) {
            // Calculate proportional concession for this installment
            const instGross = inst.amount;
            const instConcession = (concessionAmountTotal / headTotal) * instGross;
            const instNet = instGross - instConcession;

            itemsToCreate.push({
              schoolId,
              academicYearId,
              studentId,
              feeHeadId: feeHead.id,
              month: inst.month,
              year: inst.year,
              grossAmount: instGross,
              concessionAmount: instConcession,
              netAmount: instNet,
              balanceAmount: instNet,
              dueDate: inst.dueDate,
              status: "UNPAID",
            });
          }
        }
      }
    }

    // 3. Batch create all new items
    if (itemsToCreate.length > 0) {
      await tx.studentInvoiceItem.createMany({
        data: itemsToCreate,
      });
    }
  }

  /**
   * Processes all overdue invoices: updates status and applies late fees.
   */
  static async processOverdueInvoices(
    schoolId: string,
    academicYearId: string,
    createdBy: string,
  ) {
    const now = new Date();

    const overdueItems = await prisma.studentInvoiceItem.findMany({
      where: {
        schoolId,
        academicYearId,
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
        dueDate: { lt: now },
      },
      include: {
        feeHead: true,
      },
    });

    const { LateFeeService } = require("./LateFeeService");

    for (const item of overdueItems) {
      // 1. Mark as OVERDUE
      await prisma.studentInvoiceItem.update({
        where: { id: item.id },
        data: { status: "OVERDUE" },
      });

      // 2. Apply Late Fee if it's not already applied for this item
      const outstandingAmount = item.netAmount - item.paidAmount;
      if (outstandingAmount > 0) {
        await LateFeeService.applyLateFee(
          schoolId,
          academicYearId,
          item.studentId,
          item.dueDate || now,
          now,
          outstandingAmount,
          createdBy,
        );

        // 🔔 Notify student + parents of overdue fees (fire-and-forget)
        const dueDateStr = item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "recently";
        fcmTriggers.notifyFeesDue(item.studentId, outstandingAmount, dueDateStr, schoolId);
      }
    }
  }

  /**
   * Calculates carry forward balance for a specific billing cycle.
   */
  static async getCarryForwardBalance(
    studentId: string,
    beforeMonth: number,
    beforeYear: number,
  ): Promise<number> {
    const unpaidItems = await prisma.studentInvoiceItem.findMany({
      where: {
        studentId,
        status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] },
        OR: [
          { year: { lt: beforeYear } },
          { year: beforeYear, month: { lt: beforeMonth } },
        ],
      },
    });

    return unpaidItems.reduce((acc, item) => acc + item.balanceAmount, 0);
  }

  /**
   * Fetches all invoice items for a specific student and academic year.
   */
  static async getStudentInvoices(studentId: string, academicYearId: string) {
    return prisma.studentInvoiceItem.findMany({
      where: {
        studentId,
        academicYearId,
      },
      include: {
        feeHead: true,
      },
      orderBy: [{ year: "asc" }, { month: "asc" }, { dueDate: "asc" }],
    });
  }
}
