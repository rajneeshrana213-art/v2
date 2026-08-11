import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AccountService } from "./AccountService";
import { LedgerPostingService, LedgerEntry } from "./LedgerPostingService";

export class DemandGenerationService {
  /**
   * Generate fee demand for a specific student or group of students
   */
  static async generateDemand(data: {
    schoolId: string;
    academicYearId: string;
    studentIds?: string[]; // If empty, all students in school
    month?: number; // Optional month for description
    year?: number;
    createdBy: string;
  }, tx?: Prisma.TransactionClient) {
    const execute = async (client: Prisma.TransactionClient) => {
      const studentWhere: any = {
        schoolId: data.schoolId,
        isActive: true, // Only active students
      };

      if (data.studentIds && data.studentIds.length > 0) {
        studentWhere.id = { in: data.studentIds };
      }

      // 1. Get all relevant student fee plans
      const studentPlans = await client.studentFeePlan.findMany({
        where: {
          schoolId: data.schoolId,
          academicYearId: data.academicYearId,
          studentId: studentWhere.id ? studentWhere.id : undefined,
          isActive: true,
        },
        include: {
          feeHeadAmounts: {
            include: { feeHead: true },
          },
          student: {
            include: { user: { select: { name: true } } },
          },
        },
      });

      const systemAccountMap = await AccountService.getSystemAccounts(
        data.schoolId,
        data.academicYearId,
        ["STUDENT_RECEIVABLE"],
        client
      );
      const systemAccounts = {
        STUDENT_RECEIVABLE: systemAccountMap["STUDENT_RECEIVABLE"]
      };
      const results = [];

      for (const plan of studentPlans) {
        const ledgerEntries: LedgerEntry[] = [];
        let totalStudentDemand = 0;

        for (const headAmount of plan.feeHeadAmounts) {
          // 1. Check for existing demand for this head + month/year (Idempotency)
          const monthYearStr = data.month ? `(${data.month}/${data.year})` : "";
          const existingDemand = await client.financeLedger.findFirst({
            where: {
              studentId: plan.studentId,
              transactionType: "DEMAND_GENERATION",
              // We check for SAME fee head in the SAME period to prevent double billing on reassignment
              description: { contains: `${headAmount.feeHead.name} ${monthYearStr}` },
              academicYearId: data.academicYearId,
              schoolId: data.schoolId,
            },
          });

          if (existingDemand) {
            // console.log(`⏩ Skipping demand generation for student ${plan.studentId}, head ${headAmount.feeHead.name}: already exists.`);
            continue;
          }

          // 2. Generate demand for the GROSS amount
          // Concessions are now handled separately in ConcessionService as distinct ledger entries
          const amount = headAmount.amount;
          
          if (amount > 0) {
            ledgerEntries.push({
              debitAccountId: systemAccounts.STUDENT_RECEIVABLE,
              creditAccountId: headAmount.feeHead.revenueAccountId,
              amount: amount,
              studentId: plan.studentId,
              description: `Fee Demand: ${headAmount.feeHead.name} ${monthYearStr}`,
              referenceTable: "StudentFeePlanHead",
              referenceId: headAmount.id,
            });
            totalStudentDemand += amount;
          }
        }

        if (ledgerEntries.length > 0) {
          const { transactionGroupId } = await LedgerPostingService.postLedgerEntries({
            schoolId: data.schoolId,
            academicYearId: data.academicYearId,
            entries: ledgerEntries,
            transactionType: "DEMAND_GENERATION",
            createdBy: data.createdBy,
            description: `Monthly Fee Demand ${data.month ? `for ${data.month}/${data.year}` : ""} - ${plan.student.user.name}`,
          }, client);

          results.push({
            studentId: plan.studentId,
            studentName: plan.student.user.name,
            amount: totalStudentDemand,
            transactionGroupId,
          });
        }
      }

      return results;
    };

    if (tx) return await execute(tx);

    return await prisma.$transaction(async (tx) => await execute(tx), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 60000, // Demand generation can be heavy
    });
  }


}
