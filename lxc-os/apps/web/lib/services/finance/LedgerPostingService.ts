import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma"; // Updated import

export interface LedgerEntry {
  debitAccountId: string;
  creditAccountId: string;
  amount: number; // Must be > 0
  description?: string;
  studentId?: string; // Optional for school-level transactions
  referenceTable?: string;
  referenceId?: string;
}

export interface LedgerPostingRequest {
  schoolId: string;
  academicYearId: string;
  entries: LedgerEntry[];
  transactionType: string;
  referenceTable?: string;
  referenceId?: string;
  paymentId?: string; // Explicit link to Payment model
  createdBy: string; // staff_id
  description?: string;
}

export class LedgerPostingService {
  /**
   * Post ledger entries with full validation and transaction safety
   * 
   * @throws Error if validation fails or transaction cannot complete
   */
  static async postLedgerEntries(
    request: LedgerPostingRequest,
    tx?: Prisma.TransactionClient // Optional transaction client for nested calls
  ): Promise<{ transactionGroupId: string; ledgerIds: string[] }> {
    const postLogic = async (client: Prisma.TransactionClient) => {
      // Step 1: Validate all accounts exist and belong to same school+year
      await this.validateAccounts(
        client,
        request.schoolId,
        request.academicYearId,
        request.entries
      );

      // Step 2: Validate financial period is OPEN
      await this.validateFinancialPeriod(
        client,
        request.schoolId,
        request.academicYearId
      );

      // Step 3: Validate double-entry (debit === credit)
      this.validateDoubleEntry(request.entries);

      // Step 4: Generate transaction group ID (links all entries)
      const transactionGroupId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Step 5: Insert all ledger entries atomically
      const ledgerIds: string[] = [];
      for (const entry of request.entries) {
        const ledgerEntry = await client.financeLedger.create({
          data: {
            schoolId: request.schoolId,
            academicYearId: request.academicYearId,
            studentId: entry.studentId || null,
            transactionGroupId,
            debitAccountId: entry.debitAccountId,
            creditAccountId: entry.creditAccountId,
            amount: entry.amount,
            transactionType: request.transactionType as any,
            referenceTable: entry.referenceTable || request.referenceTable || null, // Priority to individual entry reference
            referenceId: entry.referenceId || request.referenceId || null,
            paymentId: request.paymentId || (request.referenceTable === "Payment" ? request.referenceId : null),
            description: entry.description || request.description || null,
            createdBy: request.createdBy,
          },
        });
        ledgerIds.push(ledgerEntry.id);
      }

      return { transactionGroupId, ledgerIds };
    };

    // If a transaction client is provided, use it directly
    if (tx) {
      return await postLogic(tx);
    }

    // Otherwise, start a new SERIALIZABLE transaction
    return await prisma.$transaction(
      async (newTx) => await postLogic(newTx),
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10000,
        timeout: 30000,
      }
    );
  }

  /**
   * Validate all accounts exist and belong to same school+academic year
   */
  private static async validateAccounts(
    tx: Prisma.TransactionClient,
    schoolId: string,
    academicYearId: string,
    entries: LedgerEntry[]
  ): Promise<void> {
    const accountIds = new Set<string>();
    entries.forEach((entry) => {
      accountIds.add(entry.debitAccountId);
      accountIds.add(entry.creditAccountId);
    });

    const accounts = await tx.account.findMany({
      where: {
        id: { in: Array.from(accountIds) },
        schoolId,
        academicYearId,
      },
      select: {
        id: true,
        code: true,
        name: true,
        schoolId: true,
        academicYearId: true,
      },
    });

    if (accounts.length !== accountIds.size) {
      const foundIds = new Set(accounts.map((a) => a.id));
      const missingIds = Array.from(accountIds).filter((id) => !foundIds.has(id));
      throw new Error(
        `Invalid accounts: ${missingIds.join(", ")}. All accounts must exist and belong to school ${schoolId} and academic year ${academicYearId}`
      );
    }

    const invalidAccounts = accounts.filter(
      (a) => a.schoolId !== schoolId || a.academicYearId !== academicYearId
    );
    if (invalidAccounts.length > 0) {
      throw new Error(
        `Account mismatch: Accounts ${invalidAccounts.map((a) => a.code).join(", ")} do not belong to school ${schoolId} and academic year ${academicYearId}`
      );
    }
  }

  /**
   * Validate financial period is OPEN (not locked)
   */
  private static async validateFinancialPeriod(
    tx: Prisma.TransactionClient,
    schoolId: string,
    academicYearId: string
  ): Promise<void> {
    const now = new Date();
    const month = now.getMonth() + 1; 
    const year = now.getFullYear();

    const period = await tx.financialPeriod.findUnique({
      where: {
        schoolId_academicYearId_month_year: {
          schoolId,
          academicYearId,
          month,
          year,
        },
      },
    });

    if (period && period.isLocked) {
      throw new Error(
        `Financial period ${month}/${year} is locked. Cannot post transactions.`
      );
    }
  }

  /**
   * Validate double-entry accounting: total debit === total credit
   */
  private static validateDoubleEntry(entries: LedgerEntry[]): void {
    if (entries.length === 0) {
      throw new Error("Cannot post empty ledger entries");
    }

    const totalDebit = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredit = entries.reduce((sum, entry) => sum + entry.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(
        `Double-entry violation: Total debit (${totalDebit}) must equal total credit (${totalCredit})`
      );
    }

    const invalidAmounts = entries.filter((e) => e.amount <= 0);
    if (invalidAmounts.length > 0) {
      throw new Error(
        `Invalid amounts: All ledger amounts must be > 0. Found: ${invalidAmounts.map((e) => e.amount).join(", ")}`
      );
    }
  }

  /**
   * Reverse a transaction by creating opposite entries
   */
  static async reverseTransaction(
    transactionGroupId: string,
    schoolId: string,
    academicYearId: string,
    reason: string,
    createdBy: string
  ): Promise<{ transactionGroupId: string; ledgerIds: string[] }> {
    const originalEntries = await prisma.financeLedger.findMany({
      where: {
        transactionGroupId,
        schoolId,
        academicYearId,
      },
    });

    if (originalEntries.length === 0) {
      throw new Error(`Transaction ${transactionGroupId} not found`);
    }

    const reverseEntries: LedgerEntry[] = originalEntries.map((entry) => ({
      debitAccountId: entry.creditAccountId,
      creditAccountId: entry.debitAccountId,
      amount: entry.amount,
      studentId: entry.studentId || undefined,
      description: `REVERSAL: ${reason}`,
    }));

    return await this.postLedgerEntries({
      schoolId,
      academicYearId,
      entries: reverseEntries,
      transactionType: "REVERSAL",
      referenceTable: "FinanceLedger",
      referenceId: transactionGroupId,
      createdBy,
      description: `Reversal of ${transactionGroupId}: ${reason}`,
    });
  }
}
