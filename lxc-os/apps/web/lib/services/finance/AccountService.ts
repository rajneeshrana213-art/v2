import { Prisma, AccountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SYSTEM_ACCOUNTS = [
  { code: "STUDENT_RECEIVABLE", name: "Student Fees Receivable", type: "ASSET", isSystem: true, description: "Tracks outstanding dues from students" },
  { code: "CASH_IN_HAND", name: "Cash in Hand", type: "ASSET", isSystem: true, description: "Primary account for cash collections" },
  { code: "BANK_ACCOUNT", name: "Bank Account", type: "ASSET", isSystem: true, description: "Primary account for digital/bank payments" },
  { code: "STUDENT_ADVANCE", name: "Student Advance Deposit", type: "LIABILITY", isSystem: true, description: "Holds excess payments as liability" },
  { code: "CONCESSION_EXPENSE", name: "Fee Concessions & Waivers", type: "EXPENSE", isSystem: true, description: "Expense account for discounts granted" },
];

export class AccountService {
  /**
   * Ensure all mandatory system accounts exist for a school/AY.
   * If missing, they are created automatically.
   */
  static async ensureSystemAccounts(
    schoolId: string,
    academicYearId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    const created = [];

    for (const acc of SYSTEM_ACCOUNTS) {
      const existing = await client.account.findUnique({
        where: {
          schoolId_academicYearId_code: {
            schoolId,
            academicYearId,
            code: acc.code,
          },
        },
      });

      if (!existing) {
        const newAcc = await client.account.create({
          data: {
            ...acc,
            schoolId,
            academicYearId,
            type: acc.type as AccountType,
          },
        });
        created.push(newAcc);
      }
    }
    return created;
  }

  /**
   * Fetch specific system accounts. 
   * If any are missing, it triggers auto-initialization.
   */
  static async getSystemAccounts(
    schoolId: string,
    academicYearId: string,
    codes: string[],
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;

    const fetch = async () => {
      const accounts = await client.account.findMany({
        where: {
          schoolId,
          academicYearId,
          code: { in: codes },
          isSystem: true,
        },
        select: {
          id: true,
          code: true,
        },
      });

      const map: Record<string, string> = {};
      accounts.forEach(a => map[a.code] = a.id);
      return map;
    };

    let accountMap = await fetch();
    const missing = codes.filter(c => !accountMap[c]);

    if (missing.length > 0) {
      // Auto-initialize if anything is missing
      await this.ensureSystemAccounts(schoolId, academicYearId, tx);
      accountMap = await fetch(); // Retry once
      
      const stillMissing = codes.filter(c => !accountMap[c]);
      if (stillMissing.length > 0) {
        throw new Error(`Critical system accounts could not be initialized: ${stillMissing.join(", ")}`);
      }
    }

    return accountMap;
  }
}
