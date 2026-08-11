/**
 * Notification Service
 * Internal notification service with webhook support for MSG91 SMS/WhatsApp or custom push gateway
 * Enhanced with direct WhatsApp and SMS support via MSG91
 */

import { prisma } from "../../prisma";
import axios from "axios";
import logger from "../../utils/logger";
import { sendWhatsApp } from "./whatsapp-service";
import { sendSMS } from "./sms-service";
import { TripNotificationStatus } from "@prisma/client";

interface NotificationEvent {
  event: string; // e.g., "stop_approach", "stop_arrival", "trip_started", "trip_ended"
  tripId?: string;
  recipient: string; // phone number or email
  message: string;
  metadata?: Record<string, any>;
}

import { MSG91Config, getMSG91Config as getBaseMSG91Config } from "./msg91-service";
// For now, I will replicate it here to avoid modifying msg91-service.ts again immediately.
// Actually, it's better to add it to msg91-service.ts properly.

import { getTemplateIds, NotificationEventType } from "./msg91-template-service";

/**
 * Get MSG91 config from environment variables
 * (Replicated from legacy msg91Service to avoid dependency on legacy code)
 */
function getEnvMSG91Config(): MSG91Config {
  return {
    authKey: process.env.MSG91_AUTH_KEY || "",
    senderId: process.env.MSG91_SENDER_ID || "",
    route: process.env.MSG91_ROUTE || "4", // Default to transactional
    country: process.env.MSG91_COUNTRY || "91",
    // Template IDs are now managed per-event via msg91TemplateService
    // These are fallback defaults if templates not configured
    smsTemplateId: process.env.MSG91_SMS_TEMPLATE_ID,
    whatsappTemplateId: process.env.MSG91_WHATSAPP_TEMPLATE_ID,
  };
}

/**
 * Get MSG91 configuration from environment variables
 */
function getMSG91Config(eventType?: string) {
  const baseConfig = getEnvMSG91Config();
  return {
    authKey: baseConfig.authKey,
    senderId: baseConfig.senderId,
    route: baseConfig.route || "4",
    country: baseConfig.country || "91",
    smsTemplateId: baseConfig.smsTemplateId,
    whatsappTemplateId: baseConfig.whatsappTemplateId,
  };
}

/**
 * Check if recipient is a phone number
 */
function isPhoneNumber(recipient: string): boolean {
  // Basic check: starts with + or contains only digits
  return /^\+?[\d\s-]+$/.test(recipient);
}

/**
 * Send notification and log to database
 * Sends WhatsApp and SMS directly via MSG91, and also sends POST request to NOTIFICATION_WEBHOOK_URL if configured
 */
export async function sendNotification(event: NotificationEvent): Promise<void> {
  const { event: eventType, tripId, recipient, message, metadata = {} } = event;

  try {
    // Log notification to database
    const notification = await prisma.tripNotification.create({
      data: {
        tripId: tripId || null,
        event: eventType,
        recipient,
        message,
        status: TripNotificationStatus.PENDING,
        webhookUrl: process.env.NOTIFICATION_WEBHOOK_URL || null,
      },
    });

    // Map event type to NotificationEventType
    const eventTypeMap: Record<string, NotificationEventType> = {
      trip_started: NotificationEventType.TRIP_STARTED,
      trip_ended: NotificationEventType.TRIP_ENDED,
      stop_approach: NotificationEventType.STOP_APPROACH,
      stop_arrival: NotificationEventType.STOP_ARRIVAL,
    };
    
    const mappedEventType = eventTypeMap[eventType] || NotificationEventType.TRIP_STARTED;
    
    // Get template IDs for this event (try to get schoolId from metadata or trip)
    let schoolId: string | undefined;
    if (metadata?.schoolId) {
      schoolId = metadata.schoolId;
    } else if (tripId) {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { schoolId: true },
      });
      schoolId = trip?.schoolId;
    }
    
    const baseConfig = getMSG91Config();
    const templateIds = await getTemplateIds(mappedEventType, schoolId);
    const msg91Config = {
      ...baseConfig,
      smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
      whatsappTemplateId: templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
    };
    
    let whatsappSent = false;
    let smsSent = false;

    // Send WhatsApp if recipient is a phone number and MSG91 is configured
    if (isPhoneNumber(recipient) && msg91Config.authKey && msg91Config.senderId) {
      try {
        await sendWhatsApp(recipient, message, msg91Config);
        whatsappSent = true;
        logger.info(`WhatsApp notification sent: ${eventType} to ${recipient}`);
      } catch (whatsappError: any) {
        logger.error(`WhatsApp notification failed: ${whatsappError.message}`, whatsappError);
      }
    }

    // Send SMS if recipient is a phone number and MSG91 is configured
    if (isPhoneNumber(recipient) && msg91Config.authKey && msg91Config.senderId) {
      try {
        await sendSMS(recipient, message, msg91Config);
        smsSent = true;
        logger.info(`SMS notification sent: ${eventType} to ${recipient}`);
      } catch (smsError: any) {
        logger.error(`SMS notification failed: ${smsError.message}`, smsError);
      }
    }

    // Send to webhook if configured
    const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookPayload = {
          event: eventType,
          tripId,
          recipient,
          message,
          metadata,
          notificationId: notification.id,
        };

        const response = await axios.post(webhookUrl, webhookPayload, {
          timeout: 10000, // 10 second timeout
          headers: {
            "Content-Type": "application/json",
            ...(process.env.NOTIFICATION_WEBHOOK_SECRET && {
              Authorization: `Bearer ${process.env.NOTIFICATION_WEBHOOK_SECRET}`,
            }),
          },
        });

        // Update notification with webhook response
        await prisma.tripNotification.update({
          where: { id: notification.id },
          data: {
            webhookSent: true,
            webhookResponse: response.data,
            status: whatsappSent || smsSent ? TripNotificationStatus.SENT : TripNotificationStatus.PENDING,
            sentAt: whatsappSent || smsSent ? new Date() : undefined,
          },
        });

        logger.info(`Notification sent via webhook: ${eventType} to ${recipient}`);
      } catch (webhookError: any) {
        logger.error(`Webhook notification failed: ${webhookError.message}`, webhookError);

        // Update notification with error
        await prisma.tripNotification.update({
          where: { id: notification.id },
          data: {
            webhookSent: false,
            webhookResponse: {
              error: webhookError.message,
              statusCode: webhookError.response?.status,
            },
            status: whatsappSent || smsSent ? TripNotificationStatus.SENT : TripNotificationStatus.FAILED,
            sentAt: whatsappSent || smsSent ? new Date() : undefined,
          },
        });
      }
    } else {
      // No webhook configured, update status based on WhatsApp/SMS success
      await prisma.tripNotification.update({
        where: { id: notification.id },
        data: {
          status: whatsappSent || smsSent ? TripNotificationStatus.SENT : TripNotificationStatus.PENDING,
          sentAt: whatsappSent || smsSent ? new Date() : undefined,
        },
      });

      if (whatsappSent || smsSent) {
        logger.info(`Notification sent (WhatsApp: ${whatsappSent}, SMS: ${smsSent}): ${eventType} to ${recipient}`);
      } else {
        logger.info(`Notification logged (no webhook/MSG91): ${eventType} to ${recipient}`);
      }
    }
  } catch (error: any) {
    logger.error(`Failed to send notification: ${error.message}`, error);
    throw error;
  }
}

/**
 * Send stop approach notification
 */
export async function notifyStopApproach(
  tripId: string,
  recipient: string,
  stopName: string,
  distance: number
): Promise<void> {
  await sendNotification({
    event: "stop_approach",
    tripId,
    recipient,
    message: `Bus is approaching ${stopName}. Distance: ${Math.round(distance)}m`,
    metadata: { stopName, distance },
  });
}

/**
 * Send stop arrival notification
 */
export async function notifyStopArrival(tripId: string, recipient: string, stopName: string): Promise<void> {
  await sendNotification({
    event: "stop_arrival",
    tripId,
    recipient,
    message: `Bus has arrived at ${stopName}`,
    metadata: { stopName },
  });
}

/**
 * Send trip started notification
 */
export async function notifyTripStarted(tripId: string, recipient: string, routeName?: string): Promise<void> {
  await sendNotification({
    event: "trip_started",
    tripId,
    recipient,
    message: routeName ? `Trip started on route: ${routeName}` : "Trip has started",
    metadata: { routeName },
  });
}

/**
 * Send trip ended notification
 */
export async function notifyTripEnded(tripId: string, recipient: string, routeName?: string): Promise<void> {
  await sendNotification({
    event: "trip_ended",
    tripId,
    recipient,
    message: routeName ? `Trip ended on route: ${routeName}` : "Trip has ended",
    metadata: { routeName },
  });
}
