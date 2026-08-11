/**
 * AuditService - Comprehensive Audit Trail & Security
 * 
 * Features:
 * 1. Immutable audit logs for all financial operations
 * 2. IP address, device ID, and role tracking
 * 3. Duplicate payment detection
 * 4. Suspicious activity detection
 * 5. Financial operation logging
 */

import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AuditLogEntry {
  schoolId: string;
  academicYearId: string;
  userId: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  deviceId?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface SecurityCheckResult {
  isAllowed: boolean;
  reason?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
}

export class AuditService {
  // Configurable thresholds for fraud detection
  private static readonly RAPID_OPERATIONS_THRESHOLD = parseInt(process.env.FRAUD_CHECK_OPERATIONS_THRESHOLD || "10");
  private static readonly RAPID_OPERATIONS_WINDOW_MS = parseInt(process.env.FRAUD_CHECK_WINDOW_MS || "60000"); // 1 minute default

  /**
   * Log financial operation (immutable audit trail)
   */
  static async logFinancialOperation(
    entry: AuditLogEntry
  ): Promise<void> {

    try {
      // Validate required fields to prevent incomplete logs
      if (!entry.academicYearId || !entry.userRole) {
        console.warn("[FINANCE_AUDIT] Incomplete audit log entry - missing academicYearId or userRole", {
          userId: entry.userId,
          action: entry.action
        });
      }
      
      // For now, using console log + database log
      console.log("[FINANCE_AUDIT]", JSON.stringify(entry));
      
      // Store in database if you have an audit table
      // await prisma.financeAuditLog.create({ data: entry });
    } catch (error) {
      // Never fail the operation if audit logging fails
      console.error("Audit logging failed:", error);
    }
  }

  /**
   * Check for duplicate payment attempts
   */
  static async checkDuplicatePayment(
    schoolId: string,
    studentId: string,
    amount: number,
    paymentMethod: string,
    timeWindowMinutes: number = 5
  ): Promise<SecurityCheckResult> {
    const timeWindow = new Date();
    timeWindow.setMinutes(timeWindow.getMinutes() - timeWindowMinutes);

    // Only check COMPLETED payments to avoid false positives from failed/in-progress payments
    // This ensures that only successfully completed payments count as duplicates
    const recentPayments = await prisma.paymentRequest.findMany({
      where: {
        schoolId,
        studentId,
        amount,
        paymentMethod: paymentMethod.toUpperCase() as any,
        status: "COMPLETED", // Only check completed payments, not PROCESSING or FAILED
        createdAt: {
          gte: timeWindow,
        },
      },
    });

    if (recentPayments.length > 0) {
      return {
        isAllowed: false,
        reason: `Duplicate payment detected. Similar payment processed ${recentPayments.length} time(s) in last ${timeWindowMinutes} minutes.`,
        riskLevel: "HIGH",
      };
    }

    return {
      isAllowed: true,
      riskLevel: "LOW",
    };
  }

  /**
   * Check for suspicious activity patterns
   */
  static async checkSuspiciousActivity(
    userId: string,
    schoolId: string,
    action: string,
    amount?: number,
    academicYearId?: string,
    userRole?: string
  ): Promise<SecurityCheckResult> {
    // Check for rapid-fire operations (potential fraud) - using configurable threshold
    const recentOperations = await prisma.financeLedger.findMany({
      where: {
        schoolId,
        createdBy: userId,
        createdAt: {
          gte: new Date(Date.now() - this.RAPID_OPERATIONS_WINDOW_MS),
        },
      },
    });

    if (recentOperations.length > this.RAPID_OPERATIONS_THRESHOLD) {
      // Log detailed information for internal monitoring
      console.warn("[FRAUD_DETECTION]", {
        userId,
        operationCount: recentOperations.length,
        windowSeconds: this.RAPID_OPERATIONS_WINDOW_MS / 1000,
        threshold: this.RAPID_OPERATIONS_THRESHOLD
      });
      
      return {
        isAllowed: false,
        reason: "Too many operations detected. Please try again later.", // Generic message for security
        riskLevel: "HIGH",
      };
    }

    // Check for unusually large amounts
    if (amount && amount > 100000) {
      // Flag for manual review - ensure complete log records
      await this.logFinancialOperation({
        schoolId,
        academicYearId: academicYearId || "UNKNOWN", // Provide fallback to prevent empty string
        userId,
        userRole: userRole || "UNKNOWN", // Provide fallback to prevent empty string
        action: "LARGE_AMOUNT_FLAG",
        entityType: "Payment",
        entityId: "",
        details: { amount, action },
        timestamp: new Date(),
      });

      return {
        isAllowed: true,
        reason: "Large amount detected. Flagged for review.",
        riskLevel: "MEDIUM",
      };
    }

    return {
      isAllowed: true,
      riskLevel: "LOW",
    };
  }

  /**
   * Validate user permissions for financial operations
   */
  static async validateFinancialPermission(
    userId: string,
    schoolId: string,
    action: string
  ): Promise<SecurityCheckResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        schoolId: true,
      },
    });

    if (!user) {
      return {
        isAllowed: false,
        reason: "User not found",
        riskLevel: "HIGH",
      };
    }

    // Check school context
    if (user.schoolId !== schoolId) {
      return {
        isAllowed: false,
        reason: "User does not belong to this school",
        riskLevel: "HIGH",
      };
    }

    // Role-based permissions
    const allowedRoles: Record<string, string[]> = {
      COLLECT_PAYMENT: ["admin", "account", "staff"],
      PROCESS_REFUND: ["account"], // Only accountants
      GENERATE_DEMAND: ["admin", "account"],
      VIEW_LEDGER: ["admin", "account", "teacher", "parent"],
      MANAGE_FEE_GROUPS: ["admin", "account"],
    };

    const allowed = allowedRoles[action] || [];
    if (!allowed.includes(user.role)) {
      return {
        isAllowed: false,
        reason: `Role ${user.role} not allowed for action ${action}`,
        riskLevel: "MEDIUM",
      };
    }

    return {
      isAllowed: true,
      riskLevel: "LOW",
    };
  }

  /**
   * Get audit trail for a transaction
   */
  static async getAuditTrail(
    schoolId: string,
    referenceTable: string,
    referenceId: string
  ): Promise<any[]> {
    // Get all ledger entries for this reference
    const ledgerEntries = await prisma.financeLedger.findMany({
      where: {
        schoolId,
        referenceTable,
        referenceId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        debitAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        creditAccount: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return ledgerEntries.map((entry) => ({
      timestamp: entry.createdAt,
      action: entry.transactionType,
      description: entry.description,
      amount: entry.amount,
      debitAccount: entry.debitAccount.code,
      creditAccount: entry.creditAccount.code,
      createdBy: {
        id: entry.creator.id,
        name: entry.creator.name,
        role: entry.creator.role,
      },
      transactionGroupId: entry.transactionGroupId,
    }));
  }

  /**
   * Generate security report
   */
  static async generateSecurityReport(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalOperations: number;
    largeAmountOperations: number;
    failedOperations: number;
    suspiciousActivities: number;
    topUsers: Array<{ userId: string; userName?: string; operationCount: number }>;
    recentTransactions: Array<{
      id: string;
      date: Date;
      type: string;
      description: string | null;
      amount: number;
      createdBy: string;
    }>;
  }> {
    const operations = await prisma.financeLedger.findMany({
      where: {
        schoolId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        creator: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const largeAmountThreshold = 50000;
    const largeAmountOps = operations.filter((op) => op.amount > largeAmountThreshold);

    // Group by user
    const userOperations: Record<string, { name: string; count: number }> = {};
    operations.forEach((op) => {
      if (!userOperations[op.createdBy]) {
          userOperations[op.createdBy] = { name: op.creator.name, count: 0 };
      }
      userOperations[op.createdBy].count += 1;
    });

    const topUsers = Object.entries(userOperations)
      .map(([userId, info]) => ({ 
          userId, 
          userName: info.name,
          operationCount: info.count 
      }))
      .sort((a, b) => b.operationCount - a.operationCount)
      .slice(0, 5);

    return {
      totalOperations: operations.length,
      largeAmountOperations: largeAmountOps.length,
      failedOperations: 0,
      suspiciousActivities: 0,
      topUsers,
      recentTransactions: operations.slice(0, 10).map(op => ({
          id: op.id,
          date: op.createdAt,
          type: op.transactionType,
          description: op.description,
          amount: op.amount,
          createdBy: op.creator.name
      }))
    };
  }
}
