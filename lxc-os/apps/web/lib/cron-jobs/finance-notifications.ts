/**
 * Finance Notification Cron Jobs
 *
 * Schedules:
 * 1. Daily fee due reminders (7 days before due)
 * 2. Weekly overdue alerts (30+ days overdue)
 * 3. Monthly demand generation
 */

// import cron from "node-cron"; // Cron jobs in Next.js usually run via API route handler + Vercel Cron or external trigger.
// For now, keeping the logic as a function to be called by a scheduler.
// Actually, I'll export the schedule functions so they can be imported in a central scheduler or API route.

import { prisma } from "@/lib/prisma";
// import { DemandCronService } from "../modules/finance/services/DemandCronService"; // MISSING
import { WhatsAppNotificationService } from "@/lib/services/finance/WhatsAppNotificationService";
import { getMSG91Config } from "@/lib/services/notification/msg91-service";

const MSG91_CONFIG = getMSG91Config();

/**
 * Daily Fee Due Reminders
 */
export const processFeeDueReminders = async () => {
  console.log("[CRON] Starting fee due reminders...");

  try {
    const schools = await prisma.school.findMany({
      include: {
        academicYears: {
          where: {
            isActive: true,
          },
        },
      },
    });

    await Promise.all(
      schools.map(async (school) => {
        for (const academicYear of school.academicYears) {
          const result =
            await WhatsAppNotificationService.sendBulkFeeDueReminders(
              school.id,
              academicYear.id,
              MSG91_CONFIG,
            );

          console.log(
            `[CRON] School ${school.id}: Sent ${result.sent} reminders, ${result.failed} failed`,
          );
        }
      }),
    );
  } catch (error) {
    console.error("[CRON] Fee due reminders error:", error);
  }
};

/**
 * Weekly Overdue Alerts
 */
export const processOverdueAlerts = async () => {
  console.log("[CRON] Starting overdue alerts...");

  try {
    const schools = await prisma.school.findMany({
      include: {
        academicYears: {
          where: {
            isActive: true,
          },
        },
      },
    });

    await Promise.all(
      schools.map(async (school) => {
        for (const academicYear of school.academicYears) {
          const result =
            await WhatsAppNotificationService.sendBulkOverdueAlerts(
              school.id,
              academicYear.id,
              MSG91_CONFIG,
              30, // 30+ days overdue
            );

          console.log(
            `[CRON] School ${school.id}: Sent ${result.sent} overdue alerts, ${result.failed} failed`,
          );
        }
      }),
    );
  } catch (error) {
    console.error("[CRON] Overdue alerts error:", error);
  }
};

/**
 * Monthly Demand Generation
 */
export const processMonthlyDemandGeneration = async () => {
  console.log("[CRON] Starting monthly demand generation...");

  try {
    const schools = await prisma.school.findMany({
      include: {
        academicYears: {
          where: {
            isActive: true,
          },
        },
      },
    });

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    for (const school of schools) {
      for (const academicYear of school.academicYears) {
        try {
          // TODO: Restore this functionality when DemandCronService is located or implemented
          // const result = await DemandCronService.generateMonthlyDemands(
          //   school.id,
          //   academicYear.id,
          //   month,
          //   year,
          //   "SYSTEM"
          // );
          //
          // console.log(
          //   `[CRON] School ${school.id}: Generated demands for ${result.studentsProcessed} students, Total: ₹${result.totalDemand}`
          // );
          //
          // if (result.errors.length > 0) {
          //   console.error(`[CRON] School ${school.id}: ${result.errors.length} errors occurred`);
          // }
          console.warn(
            `[CRON] School ${school.id}: Demand generation skipped (DemandCronService missing)`,
          );
        } catch (error) {
          console.error(
            `[CRON] School ${school.id} demand generation failed:`,
            error,
          );
        }
      }
    }
  } catch (error) {
    console.error("[CRON] Monthly demand generation error:", error);
  }
};
