import { prisma } from "@/lib/prisma";
import { AccountType } from "@prisma/client";

export interface AccountImportRow {
  code: string;
  name: string;
  type: string;
  description?: string;
}

export interface FeePlanImportRow {
  admissionNo: string;
  feeStructureId: string;
}

export interface OpeningBalanceImportRow {
  admissionNo: string;
  revenueAccountCode: string;
  amount: number;
  description?: string;
  date?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{ row: number; reason: string }>;
}

export class FinanceImportService {
  /**
   * Import Chart of Accounts
   */
  static async importAccounts(
    schoolId: string,
    academicYearId: string,
    rows: AccountImportRow[],
    createdBy: string
  ): Promise<ImportResult> {
    const result: ImportResult = { success: true, imported: 0, errors: [] };
    const validTypes = Object.values(AccountType);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Assuming row 1 is header

      try {
        if (!row.code || !row.name || !row.type) {
          result.errors.push({ row: rowNum, reason: "Missing required fields (code, name, type)" });
          continue;
        }

        const typeRaw = row.type.toUpperCase().trim() as AccountType;
        if (!validTypes.includes(typeRaw)) {
          result.errors.push({ row: rowNum, reason: `Invalid account type. Valid types are: ${validTypes.join(", ")}` });
          continue;
        }

        // Check if code already exists for this school/year
        const existing = await prisma.account.findUnique({
          where: {
            schoolId_academicYearId_code: {
              schoolId,
              academicYearId,
              code: row.code.trim().toUpperCase(),
            },
          },
        });

        if (existing) {
          result.errors.push({ row: rowNum, reason: `Account code '${row.code}' already exists.` });
          continue;
        }

        await prisma.account.create({
          data: {
            schoolId,
            academicYearId,
            code: row.code.trim().toUpperCase(),
            name: row.name.trim(),
            type: typeRaw,
            description: row.description?.trim(),
            isSystem: false,
          },
        });

        result.imported++;
      } catch (error: any) {
        result.errors.push({ row: rowNum, reason: error.message || "Unknown error occurred" });
      }
    }

    if (result.errors.length > 0 && result.imported === 0) {
      result.success = false;
    }

    return result;
  }

  /**
   * Import Student Fee Plans (Assign Fee Structures to Students)
   */
  static async importFeePlans(
    schoolId: string,
    academicYearId: string,
    rows: FeePlanImportRow[],
    createdBy: string
  ): Promise<ImportResult> {
    const result: ImportResult = { success: true, imported: 0, errors: [] };

    // Batch fetching for efficiency
    const admissionNumbers = rows.map((r) => r.admissionNo.trim()).filter(Boolean);
    const feeStructureIds = [...new Set(rows.map((r) => r.feeStructureId.trim()).filter(Boolean))];

    const students = await prisma.student.findMany({
      where: { schoolId, admissionNo: { in: admissionNumbers } },
      select: { id: true, admissionNo: true },
    });
    const studentMap = new Map(students.map((s) => [s.admissionNo, s.id]));

    const feeStructures = await prisma.feeStructure.findMany({
      where: { schoolId, academicYearId, id: { in: feeStructureIds }, isActive: true },
      include: { feeHeadAmounts: true },
    });
    const feeStructureMap = new Map(feeStructures.map((fs) => [fs.id, fs]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row.admissionNo || !row.feeStructureId) {
          result.errors.push({ row: rowNum, reason: "Missing required fields (admissionNo, feeStructureId)" });
          continue;
        }

        const studentId = studentMap.get(row.admissionNo.trim());
        if (!studentId) {
          result.errors.push({ row: rowNum, reason: `Student with admissionNo '${row.admissionNo}' not found.` });
          continue;
        }

        const feeStructure = feeStructureMap.get(row.feeStructureId.trim());
        if (!feeStructure) {
          result.errors.push({ row: rowNum, reason: `Active FeeStructure '${row.feeStructureId}' not found.` });
          continue;
        }

        // Check if student already has an active fee plan for this year
        const existingPlan = await prisma.studentFeePlan.findUnique({
          where: {
            schoolId_academicYearId_studentId: {
              schoolId,
              academicYearId,
              studentId,
            }
          }
        });

        if (existingPlan) {
          result.errors.push({ row: rowNum, reason: `Student '${row.admissionNo}' already has an active fee plan in this year.` });
          continue;
        }

        // Create Fee Plan
        await prisma.studentFeePlan.create({
          data: {
            schoolId,
            academicYearId,
            studentId,
            feeStructureId: feeStructure.id,
            isActive: true,
            feeHeadAmounts: {
              create: feeStructure.feeHeadAmounts.map((fha) => ({
                feeHeadId: fha.feeHeadId,
                amount: fha.amount,
              })),
            },
          },
        });

        result.imported++;
      } catch (error: any) {
        result.errors.push({ row: rowNum, reason: error.message || "Unknown error occurred" });
      }
    }

    if (result.errors.length > 0 && result.imported === 0) {
      result.success = false;
    }

    return result;
  }

  /**
   * Import Opening Balances (Arrears / Outstanding Dues)
   * This creates a DEMAND_GENERATION ledger entry.
   */
  static async importOpeningBalances(
    schoolId: string,
    academicYearId: string,
    rows: OpeningBalanceImportRow[],
    createdBy: string
  ): Promise<ImportResult> {
    const result: ImportResult = { success: true, imported: 0, errors: [] };

    // Resolve system account for STUDENT_RECEIVABLE
    const receivableAccount = await prisma.account.findUnique({
      where: {
        schoolId_academicYearId_code: {
          schoolId,
          academicYearId,
          code: "STUDENT_RECEIVABLE",
        },
      },
    });

    if (!receivableAccount) {
      result.success = false;
      result.errors.push({ row: 0, reason: "SYSTEM ERROR: STUDENT_RECEIVABLE account not found." });
      return result;
    }

    // Batch fetching
    const admissionNumbers = rows.map((r) => r.admissionNo.trim()).filter(Boolean);
    const revCodes = [...new Set(rows.map((r) => r.revenueAccountCode.trim().toUpperCase()).filter(Boolean))];

    const students = await prisma.student.findMany({
      where: { schoolId, admissionNo: { in: admissionNumbers } },
      select: { id: true, admissionNo: true },
    });
    const studentMap = new Map(students.map((s) => [s.admissionNo, s.id]));

    const revenueAccounts = await prisma.account.findMany({
      where: { schoolId, academicYearId, code: { in: revCodes } },
      select: { id: true, code: true },
    });
    const revenueAccountMap = new Map(revenueAccounts.map((a) => [a.code, a.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row.admissionNo || !row.revenueAccountCode || row.amount === undefined) {
          result.errors.push({ row: rowNum, reason: "Missing required fields (admissionNo, revenueAccountCode, amount)" });
          continue;
        }

        const amount = Number(row.amount);
        if (isNaN(amount) || amount <= 0) {
          result.errors.push({ row: rowNum, reason: `Amount must be a positive number. Got: ${row.amount}` });
          continue;
        }

        const studentId = studentMap.get(row.admissionNo.trim());
        if (!studentId) {
          result.errors.push({ row: rowNum, reason: `Student with admissionNo '${row.admissionNo}' not found.` });
          continue;
        }

        const revCode = row.revenueAccountCode.trim().toUpperCase();
        const creditAccountId = revenueAccountMap.get(revCode);
        if (!creditAccountId) {
          result.errors.push({ row: rowNum, reason: `Revenue Account with code '${revCode}' not found in current academic year.` });
          continue;
        }

        // Generate synthetic transaction group ID
        const txGroupId = `IMPORT_OB_${Date.now()}_${i}`;
        const entryDate = row.date ? new Date(row.date) : new Date();

        await prisma.financeLedger.create({
          data: {
            schoolId,
            academicYearId,
            studentId,
            transactionGroupId: txGroupId,
            debitAccountId: receivableAccount.id, // Debit Receivables (Asset increases)
            creditAccountId,                      // Credit Revenue/Equity
            amount,
            transactionType: "DEMAND_GENERATION",
            referenceTable: "OpeningBalance",
            description: row.description || `Opening Balance Import - ${revCode}`,
            createdBy,
            createdAt: entryDate,
          },
        });

        result.imported++;
      } catch (error: any) {
        result.errors.push({ row: rowNum, reason: error.message || "Unknown error occurred" });
      }
    }

    if (result.errors.length > 0 && result.imported === 0) {
      result.success = false;
    }

    return result;
  }
}
