import { prisma } from "../prisma";
import { sendSubscriptionReminder } from "../services/emailService";
import { SubscriptionStatus } from "@prisma/client";
import { createPlanInvoice } from "../utils/invoice-utils";

/**
 * Cron helper to:
 *  - Mark subscriptions as EXPIRED when end date has passed.
 *  - Send reminder emails for subscriptions nearing expiry.
 *
 * This job does NOT auto-create Razorpay orders; true auto-renewal
 * should be handled via Razorpay Subscriptions in the future.
 */
export async function checkSubscriptions() {
  const now = new Date();

  // 1. Mark expired subscriptions (Aware of Grace Period)
  const subscriptions = await prisma.subscription.findMany({
    where: {
      isActive: true,
      status: { not: SubscriptionStatus.EXPIRED },
    },
    include: {
      school: { include: { user: true, subscriptionConfig: true } },
      schoolGroup: { include: { owner: true } },
    },
  });

  const expired: any[] = [];
  await Promise.all(
    subscriptions.map(async (sub) => {
      const config = sub.school?.subscriptionConfig || (sub.schoolGroup as any)?.subscriptionConfig;
      const gracePeriodDays = (config as any)?.gracePeriodDays || 0;
      const gracePeriodEndDate = new Date(
        sub.endDate.getTime() + gracePeriodDays * 86400000,
      );

      if (now > gracePeriodEndDate) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: SubscriptionStatus.EXPIRED,
            isActive: false,
          },
        });
        expired.push(sub);

        // Auto-suspend
        if (sub.schoolId && (config as any)?.autoSuspendAfterGrace) {
          await prisma.school.update({
            where: { id: sub.schoolId },
            data: { isActive: false },
          });
        }
      }
    }),
  );

  // 2. Send reminders for subscriptions ending in the next N days (7, 3, 1)
  const upcoming = await prisma.subscription.findMany({
    where: {
      isActive: true,
      endDate: { gt: now },
      status: SubscriptionStatus.ACTIVE
    },
    include: {
      school: { include: { user: true } },
      schoolGroup: { include: { owner: true } },
      plan: true,
    },
  });

  const remindersSent: any[] = [];
  await Promise.all(
    upcoming.map(async (sub) => {
      const recipientEmail =
        sub.school?.user?.email || sub.schoolGroup?.owner?.email;
      const schoolName = sub.school?.schoolName || sub.schoolGroup?.name;

      if (!recipientEmail || !schoolName) return;

      const diffTime = sub.endDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (24 * 60 * 60 * 1000));

      // Specific notification triggers for SaaS-grade experience
      if ([7, 3, 1].includes(daysLeft)) {
        const priority = daysLeft === 1 ? "URGENT" : "REMINDER";
        const message = `${priority}: Your "${sub.plan.name}" plan expires in ${daysLeft} day(s). If auto-renew is disabled, please renew now to avoid service disruption.`;
        
        try {
          await sendSubscriptionReminder(recipientEmail, schoolName, message);
          remindersSent.push(sub);

          // Generate a "DUE" status invoice
          createPlanInvoice(sub.id).catch((err) =>
            console.error(`Failed to generate DUE invoice for ${sub.id}`, err),
          );
        } catch (err) {
          console.error(`Failed to send ${daysLeft}-day reminder`, err);
        }
      }
    }),
  );

  return {
    expiredCount: expired.length,
    reminderCount: upcoming.length,
  };
}
