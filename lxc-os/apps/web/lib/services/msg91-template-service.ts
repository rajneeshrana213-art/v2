/**
 * MSG91 Template Service
 * Manages DLT template IDs for different notification types
 */

import { prisma } from "@/lib/prisma";
import logger from "@/lib/utils/logger";

export enum NotificationEventType {
  // Academic
  HOMEWORK_ASSIGNED = "HOMEWORK_ASSIGNED",
  EXAM_CREATED = "EXAM_CREATED",
  RESULT_PUBLISHED = "RESULT_PUBLISHED",
  NOTICE_PUBLISHED = "NOTICE_PUBLISHED",

  // Finance
  FEE_DUE = "FEE_DUE",
  FEE_DUE_WITH_LINK = "FEE_DUE_WITH_LINK",
  FEE_PAID = "FEE_PAID",
  RECEIPT_GENERATED = "RECEIPT_GENERATED",
  PAYMENT_OVERDUE = "PAYMENT_OVERDUE",
  PAYMENT_LINK = "PAYMENT_LINK",
  CHEQUE_CLEARED = "CHEQUE_CLEARED",
  CHEQUE_BOUNCED = "CHEQUE_BOUNCED",

  // Transport
  TRIP_STARTED = "TRIP_STARTED",
  TRIP_ENDED = "TRIP_ENDED",
  STOP_APPROACH = "STOP_APPROACH",
  STOP_ARRIVAL = "STOP_ARRIVAL",
}

export interface TemplateConfig {
  smsTemplateId?: string;
  whatsappTemplateId?: string;
}

/**
 * Get template IDs for a specific event type
 * Priority: School-specific > Global
 */
export async function getTemplateIds(eventType: NotificationEventType, schoolId?: string): Promise<TemplateConfig> {
  try {
    // First try to get school-specific template
    if (schoolId) {
      const schoolTemplate = await prisma.mSG91Template.findFirst({
        where: {
          eventType,
          schoolId,
          isActive: true,
        },
      });

      if (schoolTemplate) {
        return {
          smsTemplateId: schoolTemplate.smsTemplateId || undefined,
          whatsappTemplateId: schoolTemplate.whatsappTemplateId || undefined,
        };
      }
    }

    // Fall back to global template
    const globalTemplate = await prisma.mSG91Template.findFirst({
      where: {
        eventType,
        schoolId: null,
        isActive: true,
      },
    });

    if (globalTemplate) {
      return {
        smsTemplateId: globalTemplate.smsTemplateId || undefined,
        whatsappTemplateId: globalTemplate.whatsappTemplateId || undefined,
      };
    }

    // No template found - return empty (will use non-template sending)
    return {};
  } catch (error) {
    logger.error(`Failed to get template IDs for ${eventType}:`, error);
    return {};
  }
}

/**
 * Create or update a template
 */
export async function upsertTemplate(
  eventType: NotificationEventType,
  config: TemplateConfig & { schoolId?: string; notificationType?: string }
): Promise<void> {
  try {
    const notificationType = config.notificationType || eventType;
    const schoolId = config.schoolId ?? null;

    await prisma.mSG91Template.upsert({
      where: {
        unique_template_per_event_school: {
          schoolId: schoolId || "",
          eventType,
        },
      },
      create: {
        schoolId,
        notificationType: config.notificationType as any,
        eventType,
        smsTemplateId: config.smsTemplateId || null,
        whatsappTemplateId: config.whatsappTemplateId || null,
        isActive: true,
      },
      update: {
        notificationType: config.notificationType as any,
        smsTemplateId: config.smsTemplateId || null,
        whatsappTemplateId: config.whatsappTemplateId || null,
        updatedAt: new Date(),
      },
    });

    logger.info(`Template upserted for ${eventType}${config.schoolId ? ` (school: ${config.schoolId})` : " (global)"}`);
  } catch (error) {
    logger.error(`Failed to upsert template for ${eventType}:`, error);
    throw error;
  }
}

/**
 * Get all templates for a school (or global)
 */
export async function getAllTemplates(schoolId?: string) {
  return await prisma.mSG91Template.findMany({
    where: {
      ...(schoolId ? { schoolId } : { schoolId: null }),
      isActive: true,
    },
    orderBy: {
      eventType: "asc",
    },
  });
}

/**
 * Deactivate a template
 */
export async function deactivateTemplate(templateId: string): Promise<void> {
  await prisma.mSG91Template.update({
    where: { id: templateId },
    data: { isActive: false },
  });
}

/**
 * Initialize default templates (can be called during setup)
 */
export async function initializeDefaultTemplates(schoolId?: string): Promise<void> {
  const defaultTemplates = [
    {
      eventType: NotificationEventType.HOMEWORK_ASSIGNED,
      notificationType: "ACADEMIC",
    },
    {
      eventType: NotificationEventType.EXAM_CREATED,
      notificationType: "ACADEMIC",
    },
    {
      eventType: NotificationEventType.RESULT_PUBLISHED,
      notificationType: "ACADEMIC",
    },
    {
      eventType: NotificationEventType.NOTICE_PUBLISHED,
      notificationType: "GENERAL",
    },
    {
      eventType: NotificationEventType.FEE_DUE,
      notificationType: "FINANCE",
    },
    {
      eventType: NotificationEventType.FEE_DUE_WITH_LINK,
      notificationType: "FINANCE",
    },
    {
      eventType: NotificationEventType.FEE_PAID,
      notificationType: "FINANCE",
    },
    {
      eventType: NotificationEventType.RECEIPT_GENERATED,
      notificationType: "FINANCE",
    },
    {
      eventType: NotificationEventType.PAYMENT_OVERDUE,
      notificationType: "FINANCE",
    },
    {
      eventType: NotificationEventType.PAYMENT_LINK,
      notificationType: "FINANCE",
    },
    {
      eventType: NotificationEventType.CHEQUE_CLEARED,
      notificationType: "FINANCE",
    },
    {
      eventType: NotificationEventType.CHEQUE_BOUNCED,
      notificationType: "FINANCE",
    },
    {
      eventType: NotificationEventType.TRIP_STARTED,
      notificationType: "TRANSPORT",
    },
    {
      eventType: NotificationEventType.TRIP_ENDED,
      notificationType: "TRANSPORT",
    },
    {
      eventType: NotificationEventType.STOP_APPROACH,
      notificationType: "TRANSPORT",
    },
    {
      eventType: NotificationEventType.STOP_ARRIVAL,
      notificationType: "TRANSPORT",
    },
  ];

  for (const template of defaultTemplates) {
    try {
      await upsertTemplate(template.eventType, {
        schoolId,
        notificationType: template.notificationType,
        smsTemplateId: undefined, // Will be set by admin
        whatsappTemplateId: undefined, // Will be set by admin
      });
    } catch (error) {
      logger.error(`Failed to initialize template ${template.eventType}:`, error);
    }
  }

  logger.info(
    `Initialized ${defaultTemplates.length} default templates${schoolId ? ` for school ${schoolId}` : " (global)"}`
  );
}
