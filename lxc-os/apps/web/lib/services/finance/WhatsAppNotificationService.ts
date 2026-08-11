/**
 * WhatsAppNotificationService - Real-time Fee Notifications
 *
 * Sends WhatsApp notifications for:
 * 1. Fee due reminders
 * 2. Payment received confirmations
 * 3. Payment overdue alerts
 * 4. Cheque clearance/bounce notifications
 *
 * Uses MSG91 WhatsApp API
 */

import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/services/notification/whatsapp-service";
import { sendSMS } from "@/lib/services/notification/sms-service";
import { PaymentSettlementService } from "./PaymentSettlementService";
import {
  getTemplateIds,
  NotificationEventType,
} from "@/lib/services/notification/msg91-template-service";
import {
  getMSG91Config,
  MSG91Config,
} from "@/lib/services/notification/msg91-service";

export interface NotificationConfig extends MSG91Config {
  // Config interface extending MSG91Config for ease of use
}

export class WhatsAppNotificationService {
  /**
   * Send fee due reminder
   */
  static async sendFeeDueReminder(
    schoolId: string,
    academicYearId: string,
    studentId: string,
    config: NotificationConfig,
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
          school: {
            select: {
              schoolName: true,
            },
          },
        },
      });

      if (!student || !student.guardianPhone) {
        return;
      }

      // Get outstanding balance
      const balance = await PaymentSettlementService.getStudentBalance(
        schoolId,
        academicYearId,
        studentId,
      );

      if (balance.netBalance <= 0) {
        return; // No outstanding, no reminder needed
      }

      // Get due date (from oldest unpaid demand)
      const oldestDemand = await prisma.financeLedger.findFirst({
        where: {
          schoolId,
          academicYearId,
          studentId,
          debitAccount: {
            code: "STUDENT_RECEIVABLE",
          },
          transactionType: "DEMAND_GENERATION",
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const message = `📚 Fee Reminder - ${student.user?.name || "Student"}

Class: ${student.class?.name || "N/A"}
Admission No: ${student.admissionNo}

Outstanding Amount: ₹${balance.netBalance.toFixed(2)}
${oldestDemand ? `Due Since: ${oldestDemand.createdAt.toLocaleDateString()}` : ""}

Please make the payment at your earliest convenience.

Thank you,
${student.school?.schoolName || "School"}`;

      // Get template IDs for this event
      const baseConfig = getMSG91Config();
      const templateIds = await getTemplateIds(
        NotificationEventType.FEE_DUE,
        schoolId,
      );
      const finalConfig = {
        ...config,
        smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
        whatsappTemplateId:
          templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
      };

      // Send both WhatsApp and SMS
      await Promise.allSettled([
        sendWhatsApp(student.guardianPhone, message, finalConfig),
        sendSMS(student.guardianPhone, message, finalConfig),
      ]);
    } catch (error) {
      console.error("Fee due reminder failed:", error);
      // Don't throw - notification failures shouldn't break the system
    }
  }

  /**
   * Send payment received confirmation
   */
  static async sendPaymentConfirmation(
    studentId: string,
    amount: number,
    paymentMethod: string,
    config: NotificationConfig,
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          school: {
            select: {
              schoolName: true,
            },
          },
        },
      });

      if (!student || !student.guardianPhone) {
        return;
      }

      const message = `✅ Payment Received!

Student: ${student.user?.name || "Student"}
Amount: ₹${amount.toFixed(2)}
Method: ${paymentMethod}
Date: ${new Date().toLocaleDateString()}

Thank you for your payment!

${student.school?.schoolName || "School"}`;

      // Get template IDs for this event
      const baseConfig = getMSG91Config();
      const studentRecord = await prisma.student.findUnique({
        where: { id: studentId },
        select: { schoolId: true },
      });
      const templateIds = await getTemplateIds(
        NotificationEventType.FEE_PAID,
        studentRecord?.schoolId,
      );
      const finalConfig = {
        ...config,
        smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
        whatsappTemplateId:
          templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
      };

      // Send both WhatsApp and SMS
      await Promise.allSettled([
        sendWhatsApp(student.guardianPhone, message, finalConfig),
        sendSMS(student.guardianPhone, message, finalConfig),
      ]);
    } catch (error) {
      console.error("Payment confirmation failed:", error);
    }
  }

  /**
   * Send payment overdue alert
   */
  static async sendOverdueAlert(
    schoolId: string,
    academicYearId: string,
    studentId: string,
    daysOverdue: number,
    config: NotificationConfig,
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
          school: {
            select: {
              schoolName: true,
            },
          },
        },
      });

      if (!student || !student.guardianPhone) {
        return;
      }

      const balance = await PaymentSettlementService.getStudentBalance(
        schoolId,
        academicYearId,
        studentId,
      );

      if (balance.netBalance <= 0) {
        return;
      }

      const message = `⚠️ Payment Overdue Alert

Student: ${student.user?.name || "Student"}
Class: ${student.class?.name || "N/A"}

Outstanding Amount: ₹${balance.netBalance.toFixed(2)}
Days Overdue: ${daysOverdue}

Please clear the outstanding amount immediately to avoid any inconvenience.

Contact the accounts office for assistance.

${student.school?.schoolName || "School"}`;

      // Get template IDs for this event
      const baseConfig = getMSG91Config();
      const templateIds = await getTemplateIds(
        NotificationEventType.PAYMENT_OVERDUE,
        schoolId,
      );
      const finalConfig = {
        ...config,
        smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
        whatsappTemplateId:
          templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
      };

      // Send both WhatsApp and SMS
      await Promise.allSettled([
        sendWhatsApp(student.guardianPhone, message, finalConfig),
        sendSMS(student.guardianPhone, message, finalConfig),
      ]);
    } catch (error) {
      console.error("Overdue alert failed:", error);
    }
  }

  /**
   * Send cheque clearance notification
   */
  static async sendChequeClearanceNotification(
    studentId: string,
    chequeNumber: string,
    amount: number,
    config: NotificationConfig,
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          school: {
            select: {
              schoolName: true,
            },
          },
        },
      });

      if (!student || !student.guardianPhone) {
        return;
      }

      const message = `✅ Cheque Cleared

Student: ${student.user?.name || "Student"}
Cheque No: ${chequeNumber}
Amount: ₹${amount.toFixed(2)}
Date: ${new Date().toLocaleDateString()}

Your cheque has been successfully cleared.

${student.school?.schoolName || "School"}`;

      // Get template IDs for this event
      const baseConfig = getMSG91Config();
      const studentRecord = await prisma.student.findUnique({
        where: { id: studentId },
        select: { schoolId: true },
      });
      const templateIds = await getTemplateIds(
        NotificationEventType.CHEQUE_CLEARED,
        studentRecord?.schoolId,
      );
      const finalConfig = {
        ...config,
        smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
        whatsappTemplateId:
          templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
      };

      // Send both WhatsApp and SMS
      await Promise.allSettled([
        sendWhatsApp(student.guardianPhone, message, finalConfig),
        sendSMS(student.guardianPhone, message, finalConfig),
      ]);
    } catch (error) {
      console.error("Cheque clearance notification failed:", error);
    }
  }

  /**
   * Send cheque bounce notification
   */
  static async sendChequeBounceNotification(
    studentId: string,
    chequeNumber: string,
    amount: number,
    penaltyAmount: number,
    reason: string,
    config: NotificationConfig,
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          school: {
            select: {
              schoolName: true,
            },
          },
        },
      });

      if (!student || !student.guardianPhone) {
        return;
      }

      const message = `❌ Cheque Bounced

Student: ${student.user?.name || "Student"}
Cheque No: ${chequeNumber}
Amount: ₹${amount.toFixed(2)}
Reason: ${reason}

Penalty Applied: ₹${penaltyAmount.toFixed(2)}

Please contact the accounts office immediately to resolve this issue.

${student.school?.schoolName || "School"}`;

      // Get template IDs for this event
      const baseConfig = getMSG91Config();
      const studentRecord = await prisma.student.findUnique({
        where: { id: studentId },
        select: { schoolId: true },
      });
      const templateIds = await getTemplateIds(
        NotificationEventType.CHEQUE_BOUNCED,
        studentRecord?.schoolId,
      );
      const finalConfig = {
        ...config,
        smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
        whatsappTemplateId:
          templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
      };

      // Send both WhatsApp and SMS
      await Promise.allSettled([
        sendWhatsApp(student.guardianPhone, message, finalConfig),
        sendSMS(student.guardianPhone, message, finalConfig),
      ]);
    } catch (error) {
      console.error("Cheque bounce notification failed:", error);
    }
  }

  /**
   * Send bulk fee due reminders
   */
  static async sendBulkFeeDueReminders(
    schoolId: string,
    academicYearId: string,
    config: NotificationConfig,
    jobId?: string,
    daysBeforeDue: number = 7,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    try {
      const students = await prisma.student.findMany({
        where: {
          schoolId,
          status: "ACTIVE",
        },
      });

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        try {
          await this.sendFeeDueReminder(
            schoolId,
            academicYearId,
            student.id,
            config,
          );
          sent++;
        } catch (error) {
          console.error(
            `Failed to send reminder to student ${student.id}:`,
            error,
          );
          failed++;
        }

        if (jobId) {
          const {
            BulkUploadJobService,
          } = require("@/lib/services/bulk-upload-job-service");
          BulkUploadJobService.updateProgress(jobId, i + 1, sent, failed);
        }
      }
    } catch (error) {
      console.error("Bulk reminder failed:", error);
    }

    return { sent, failed };
  }

  /**
   * Send overdue alerts
   */
  static async sendBulkOverdueAlerts(
    schoolId: string,
    academicYearId: string,
    config: NotificationConfig,
    overdueDays: number = 30,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    try {
      const students = await prisma.student.findMany({
        where: {
          schoolId,
          status: "ACTIVE",
        },
      });

      const now = new Date();

      for (const student of students) {
        try {
          const balance = await PaymentSettlementService.getStudentBalance(
            schoolId,
            academicYearId,
            student.id,
          );

          if (balance.netBalance <= 0) {
            continue;
          }

          const oldestDemand = await prisma.financeLedger.findFirst({
            where: {
              schoolId,
              academicYearId,
              studentId: student.id,
              debitAccount: {
                code: "STUDENT_RECEIVABLE",
              },
              transactionType: "DEMAND_GENERATION",
            },
            orderBy: {
              createdAt: "asc",
            },
          });

          if (!oldestDemand) {
            continue;
          }

          const daysOverdue = Math.floor(
            (now.getTime() - oldestDemand.createdAt.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (daysOverdue >= overdueDays) {
            await this.sendOverdueAlert(
              schoolId,
              academicYearId,
              student.id,
              daysOverdue,
              config,
            );
            sent++;
          }
        } catch (error) {
          console.error(
            `Failed to send overdue alert to student ${student.id}:`,
            error,
          );
          failed++;
        }
      }
    } catch (error) {
      console.error("Bulk overdue alerts failed:", error);
    }

    return { sent, failed };
  }

  /**
   * Send receipt notification
   */
  static async sendReceiptNotification(
    studentId: string,
    receiptNumber: string,
    receiptUrl: string,
    amount: number,
    config: NotificationConfig,
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          school: {
            select: {
              schoolName: true,
            },
          },
        },
      });

      if (!student || !student.guardianPhone) {
        return;
      }

      const message = `📄 Payment Receipt Generated

Student: ${student.user?.name || "Student"}
Receipt No: ${receiptNumber}
Amount: ₹${amount.toFixed(2)}
Date: ${new Date().toLocaleDateString()}

Download your receipt:
${receiptUrl}

Thank you for your payment!

${student.school?.schoolName || "School"}`;

      // Get template IDs for this event
      const baseConfig = getMSG91Config();
      const templateIds = await getTemplateIds(
        NotificationEventType.RECEIPT_GENERATED,
        student.schoolId,
      );
      const finalConfig = {
        ...config,
        smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
        whatsappTemplateId:
          templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
      };

      // Send both WhatsApp and SMS
      await Promise.allSettled([
        sendWhatsApp(student.guardianPhone, message, finalConfig),
        sendSMS(student.guardianPhone, message, finalConfig),
      ]);
    } catch (error) {
      console.error("Receipt notification failed:", error);
    }
  }

  /**
   * Send payment link notification
   */
  static async sendPaymentLink(
    studentId: string,
    paymentLinkUrl: string,
    amount: number,
    description: string,
    config: NotificationConfig,
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
          school: {
            select: {
              schoolName: true,
            },
          },
        },
      });

      if (!student || !student.guardianPhone) {
        return;
      }

      const message = `💳 Payment Link - ${student.school?.schoolName || "School"}

Dear Parent,

Fee payment is due for:
Student: ${student.user?.name || "Student"}
Class: ${student.class?.name || "N/A"}
Amount: ₹${amount.toFixed(2)}
Description: ${description}

Pay online securely:
${paymentLinkUrl}

This link is valid for 7 days.

Thank you!`;

      // Get template IDs for this event
      const baseConfig = getMSG91Config();
      const templateIds = await getTemplateIds(
        NotificationEventType.PAYMENT_LINK,
        student.schoolId,
      );
      const finalConfig = {
        ...config,
        smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
        whatsappTemplateId:
          templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
      };

      // Send both WhatsApp and SMS
      await Promise.allSettled([
        sendWhatsApp(student.guardianPhone, message, finalConfig),
        sendSMS(student.guardianPhone, message, finalConfig),
      ]);
    } catch (error) {
      console.error("Payment link notification failed:", error);
    }
  }

  /**
   * Send fee due reminder with payment link
   */
  static async sendFeeDueReminderWithPaymentLink(
    schoolId: string,
    academicYearId: string,
    studentId: string,
    paymentLinkUrl: string,
    config: NotificationConfig,
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
          school: {
            select: {
              schoolName: true,
            },
          },
        },
      });

      if (!student || !student.guardianPhone) {
        return;
      }

      // Get outstanding balance
      const balance = await PaymentSettlementService.getStudentBalance(
        schoolId,
        academicYearId,
        studentId,
      );

      if (balance.netBalance <= 0) {
        return; // No outstanding, no reminder needed
      }

      const message = `📚 Fee Reminder - ${student.user?.name || "Student"}

Class: ${student.class?.name || "N/A"}
Admission No: ${student.admissionNo}

Outstanding Amount: ₹${balance.netBalance.toFixed(2)}

Pay online securely:
${paymentLinkUrl}

Or visit the school office to make payment.

Thank you,
${student.school?.schoolName || "School"}`;

      // Get template IDs for this event
      const baseConfig = getMSG91Config();
      const templateIds = await getTemplateIds(
        NotificationEventType.FEE_DUE_WITH_LINK,
        schoolId,
      );
      const finalConfig = {
        ...config,
        smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
        whatsappTemplateId:
          templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
      };

      // Send both WhatsApp and SMS
      await Promise.allSettled([
        sendWhatsApp(student.guardianPhone, message, finalConfig),
        sendSMS(student.guardianPhone, message, finalConfig),
      ]);
    } catch (error) {
      console.error("Fee due reminder with payment link failed:", error);
    }
  }
}
