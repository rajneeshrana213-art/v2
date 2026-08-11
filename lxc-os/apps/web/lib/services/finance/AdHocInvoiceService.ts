import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LedgerPostingService, LedgerEntry } from "./LedgerPostingService";
import { PaymentSettlementService } from "./PaymentSettlementService";
import puppeteer from "puppeteer";
import { uploadFile } from "@/lib/config/upload";
import ejs from "ejs";
import path from "path";

export interface AdHocInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AdHocInvoiceRequest {
  schoolId: string;
  academicYearId: string;
  studentId?: string; // Optional - can be school-level invoice
  items: AdHocInvoiceItem[];
  dueDate?: Date;
  description?: string;
  createdBy: string;
}

export interface AdHocInvoiceResult {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  transactionGroupId: string;
  invoiceUrl?: string;
}

export class AdHocInvoiceService {
  /**
   * Create an ad-hoc invoice (one-time charge)
   */
  static async createInvoice(request: AdHocInvoiceRequest): Promise<AdHocInvoiceResult> {
    const result = await prisma.$transaction(
      async (tx) => {
        const totalAmount = request.items.reduce((sum, item) => sum + item.total, 0);

        if (totalAmount <= 0) {
          throw new Error("Invoice total must be greater than 0");
        }

        const invoiceNumber = await this.generateInvoiceNumber(tx, request.schoolId);
        const systemAccounts = await this.getSystemAccounts(tx, request.schoolId, request.academicYearId);
        const revenueAccount = await this.getOrCreateAdHocRevenueAccount(tx, request.schoolId, request.academicYearId);

        const ledgerEntries: LedgerEntry[] = [];

        if (request.studentId) {
          ledgerEntries.push({
            debitAccountId: systemAccounts.STUDENT_RECEIVABLE,
            creditAccountId: revenueAccount.id,
            amount: totalAmount,
            studentId: request.studentId,
            description: request.description || `Ad-hoc invoice: ${request.items.map((i) => i.description).join(", ")}`,
          });
        } else {
          ledgerEntries.push({
            debitAccountId: systemAccounts.CASH_IN_HAND,
            creditAccountId: revenueAccount.id,
            amount: totalAmount,
            studentId: undefined,
            description: request.description || `Ad-hoc sale: ${request.items.map((i) => i.description).join(", ")}`,
          });
        }

        const { transactionGroupId } = await LedgerPostingService.postLedgerEntries({
          schoolId: request.schoolId,
          academicYearId: request.academicYearId,
          entries: ledgerEntries,
          transactionType: request.studentId ? "DEMAND_GENERATION" : "PAYMENT_COLLECTION",
          referenceTable: "AdHocInvoice",
          createdBy: request.createdBy,
          description: `Ad-hoc invoice ${invoiceNumber}`,
        }, tx);

        return {
          invoiceId: transactionGroupId,
          invoiceNumber,
          totalAmount,
          transactionGroupId,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    // Generate PDF invoice outside the transaction (non-blocking failure)
    let invoiceUrl: string | undefined;
    if (request.studentId) {
      try {
        invoiceUrl = await this.generateInvoicePDF({
          schoolId: request.schoolId,
          studentId: request.studentId,
          invoiceNumber: result.invoiceNumber,
          items: request.items,
          totalAmount: result.totalAmount,
          dueDate: request.dueDate,
          description: request.description,
        });

        // Embed the invoice URL into the FinanceLedger description so it's
        // recoverable from getStudentInvoices without a schema migration.
        if (invoiceUrl) {
          await prisma.financeLedger.updateMany({
            where: {
              transactionGroupId: result.transactionGroupId,
              referenceTable: "AdHocInvoice",
            },
            data: {
              description: `Ad-hoc invoice ${result.invoiceNumber}|||url:${invoiceUrl}`,
            },
          });
        }
      } catch (pdfErr) {
        console.error("Ad-hoc invoice PDF generation failed (non-fatal):", pdfErr);
      }
    }

    return { ...result, invoiceUrl };
  }

  private static async generateInvoiceNumber(tx: Prisma.TransactionClient, schoolId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const lastInvoice = await tx.financeLedger.findFirst({
      where: {
        schoolId,
        description: {
          startsWith: prefix,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let sequence = 1;
    if (lastInvoice?.description) {
      const match = lastInvoice.description.match(/\d+$/);
      if (match) {
        sequence = parseInt(match[0], 10) + 1;
      }
    }

    return `${prefix}${sequence.toString().padStart(6, "0")}`;
  }

  private static async getOrCreateAdHocRevenueAccount(
    tx: Prisma.TransactionClient,
    schoolId: string,
    academicYearId: string
  ) {
    let account = await tx.account.findFirst({
      where: {
        schoolId,
        academicYearId,
        code: "ADHOC_REVENUE",
        type: "INCOME",
      },
    });

    if (!account) {
      account = await tx.account.create({
        data: {
          schoolId,
          academicYearId,
          name: "Ad-hoc Sales Revenue",
          code: "ADHOC_REVENUE",
          type: "INCOME",
          isSystem: false,
          description: "Revenue from ad-hoc invoices and one-time charges",
        },
      });
    }

    if (account.schoolId !== schoolId || account.academicYearId !== academicYearId) {
      throw new Error(
        `Ad-hoc revenue account found but belongs to different school/academic year.`
      );
    }

    return account;
  }

  private static async getSystemAccounts(
    tx: Prisma.TransactionClient,
    schoolId: string,
    academicYearId: string
  ): Promise<{
    STUDENT_RECEIVABLE: string;
    CASH_IN_HAND: string;
  }> {
    const accounts = await tx.account.findMany({
      where: {
        schoolId,
        academicYearId, 
        isSystem: true,
        code: {
          in: ["STUDENT_RECEIVABLE", "CASH_IN_HAND"],
        },
      },
      select: {
        id: true,
        code: true,
        schoolId: true,
        academicYearId: true,
      },
    });

    const accountMap: Record<string, string> = {};
    accounts.forEach((acc) => {
      accountMap[acc.code] = acc.id;
    });

    const required = ["STUDENT_RECEIVABLE", "CASH_IN_HAND"];
    const missing = required.filter((code) => !accountMap[code]);

    if (missing.length > 0) {
      for (const code of missing) {
        try {
          const name = code === "STUDENT_RECEIVABLE" ? "Student Receivables" : "Cash in Hand";
          const type = "ASSET";
          const description = code === "STUDENT_RECEIVABLE"
            ? "System Account: Tracks total pending fees to be collected from students"
            : "System Account: Tracks physical cash collected before deposit";

          const newAccount = await tx.account.create({
            data: {
              schoolId,
              academicYearId,
              code,
              name,
              type,
              isSystem: true,
              description,
            },
          });
          accountMap[code] = newAccount.id;
        } catch (createError: any) {
          const existing = await tx.account.findFirst({
            where: {
              schoolId,
              code,
              isSystem: true
            },
          });

          if (existing) {
            if (existing.academicYearId === academicYearId) {
              accountMap[code] = existing.id;
            } else {
              throw new Error(
                `System Account ${code} exists but belongs to AY ${existing.academicYearId}, requested for AY ${academicYearId}.`
              );
            }
          } else {
            throw new Error(`Critical: Failed to ensure system account ${code} exists for school ${schoolId}.`);
          }
        }
      }
    }

    return {
      STUDENT_RECEIVABLE: accountMap["STUDENT_RECEIVABLE"],
      CASH_IN_HAND: accountMap["CASH_IN_HAND"],
    };
  }

  static async getStudentInvoices(schoolId: string, academicYearId: string, studentId: string) {
    const ledgers = await prisma.financeLedger.findMany({
      where: {
        schoolId,
        academicYearId,
        studentId,
        transactionType: "DEMAND_GENERATION",
        referenceTable: "AdHocInvoice",
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
      },
      orderBy: { createdAt: "desc" },
    });

    return ledgers.map((ledger) => {
      let invoiceUrl: string | undefined;
      const urlMatch = ledger.description?.match(/\|\|\|url:(.+)/);
      if (urlMatch && urlMatch[1]) {
        invoiceUrl = urlMatch[1];
      }
      return {
        ...ledger,
        invoiceUrl,
      };
    });
  }

  /**
   * Generate a PDF invoice document for an ad-hoc invoice and upload it.
   * Returns the cloud URL of the generated PDF.
   */
  static async generateInvoicePDF(params: {
    schoolId: string;
    studentId: string;
    invoiceNumber: string;
    items: AdHocInvoiceItem[];
    totalAmount: number;
    dueDate?: Date;
    description?: string;
  }): Promise<string> {
    // Fetch student + school data
    const student = await prisma.student.findUnique({
      where: { id: params.studentId },
      include: {
        user: true,
        class: { select: { name: true } },
        school: { include: { user: true } },
      },
    });

    if (!student) throw new Error("Student not found for invoice generation");

    const school = student.school;
    const schoolName = (school as any).schoolName || "School";
    const schoolLogo = (school as any).schoolLogo || "";
    const schoolAddress = school?.user?.address || "";
    const schoolPhone = school?.user?.phone || "";
    const schoolEmail = school?.user?.email || "";
    const studentName = student.user?.name || "Student";
    const className = student.class?.name || "";
    const invoiceDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const dueDate = params.dueDate
      ? params.dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    // Render the invoice HTML from the EJS template
    const templatePath = path.join(process.cwd(), "views", "finance", "adhoc-invoice.ejs");
    const html = await ejs.renderFile(templatePath, {
      schoolName,
      schoolLogo,
      schoolAddress,
      schoolPhone,
      schoolEmail,
      studentName,
      className,
      admissionNo: student.admissionNo || "-",
      fatherName: (student as any).fatherName || "",
      invoiceNumber: params.invoiceNumber,
      invoiceDate,
      dueDate,
      items: params.items,
      totalAmount: params.totalAmount,
      description: params.description || "",
    });

    // Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = (await page.pdf({ format: "A4", printBackground: true })) as Buffer;
    await browser.close();

    // Upload PDF and return URL
    const fileName = `invoice_${params.invoiceNumber.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`;
    const upload = await uploadFile(pdfBuffer, "invoices", "raw", fileName);
    return upload.url;
  }
}
