/**
 * MSG91 Service - SMS and WhatsApp messaging
 *
 * MSG91 API Documentation:
 * - SMS API: https://control.msg91.com/api/sendhttp.php
 * - WhatsApp API: https://control.msg91.com/api/whatsapp_send.php
 */

import axios from "axios";
import logger from "../../utils/logger";

export interface MSG91Config {
  authKey: string;
  senderId: string;
  route?: string; // 4 for transactional, 1 for promotional
  country?: string; // 91 for India
  smsTemplateId?: string; // DLT Template ID for SMS
  whatsappTemplateId?: string; // DLT Template ID for WhatsApp
}

/**
 * Get MSG91 config from environment variables
 */
export function getMSG91Config(): MSG91Config {
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
 * Format phone number for MSG91 (should be 10 digits without country code for India)
 */
function formatPhoneForMSG91(phone: string): string {
  let formatted = phone.trim().replace(/[^0-9]/g, "");

  // Remove country code if present
  if (formatted.startsWith("91")) {
    formatted = formatted.substring(2);
  }

  // Remove leading zeros
  formatted = formatted.replace(/^0+/, "");

  // Should be 10 digits for India
  if (formatted.length === 10) {
    return formatted;
  }

  // If not 10 digits, try to extract last 10 digits
  if (formatted.length > 10) {
    return formatted.substring(formatted.length - 10);
  }

  return formatted;
}

/**
 * Send SMS via MSG91
 */
export async function sendSMS(to: string, message: string, config: MSG91Config): Promise<boolean> {
  try {
    if (!config.authKey || !config.senderId) {
      logger.error("MSG91 credentials missing. Set MSG91_AUTH_KEY and MSG91_SENDER_ID.");
      return false;
    }

    const phone = formatPhoneForMSG91(to);

    if (phone.length !== 10) {
      logger.error(`sendSMS aborted: recipient phone is not valid (10 digits required): ${to} -> ${phone}`);
      return false;
    }

    const route = config.route || "4"; // Default to transactional
    const country = config.country || "91"; // Default to India

    // MSG91 SMS API endpoint
    const url = "https://control.msg91.com/api/sendhttp.php";

    const params = new URLSearchParams({
      authkey: config.authKey,
      mobiles: phone,
      message: message,
      sender: config.senderId,
      route: route,
      country: country,
    });

    // Add template ID if provided (for DLT/transactional SMS)
    if (config.smsTemplateId) {
      params.append("DLT_TE_ID", config.smsTemplateId);
    }

    const response = await axios.get(`${url}?${params.toString()}`, {
      timeout: 10000,
    });

    // MSG91 returns request ID on success
    if (response.data && typeof response.data === "string") {
      const requestId = response.data.trim();
      // Check if it's a valid request ID (usually numeric)
      if (requestId && !requestId.toLowerCase().includes("error")) {
        logger.info(`SMS sent via MSG91: requestId=${requestId} to=${phone}`);
        return true;
      }
    }

    logger.error("MSG91 SMS failed:", response.data);
    return false;
  } catch (error: any) {
    logger.error("Failed to send SMS via MSG91:", {
      message: error?.message || String(error),
      response: error?.response?.data,
    });
    return false;
  }
}

/**
 * Send WhatsApp message via MSG91
 */
export async function sendWhatsApp(to: string, message: string, config: MSG91Config): Promise<boolean> {
  try {
    if (!config.authKey || !config.senderId) {
      logger.error("MSG91 WhatsApp credentials missing. Set MSG91_AUTH_KEY and MSG91_SENDER_ID.");
      return false;
    }

    const phone = formatPhoneForMSG91(to);

    if (phone.length !== 10) {
      logger.error(`sendWhatsApp aborted: recipient phone is not valid (10 digits required): ${to} -> ${phone}`);
      return false;
    }

    // MSG91 WhatsApp API endpoint
    const url = "https://control.msg91.com/api/whatsapp_send.php";

    const params = new URLSearchParams({
      authkey: config.authKey,
      mobiles: `91${phone}`, // WhatsApp needs country code
      message: message,
      sender: config.senderId,
    });

    // Add template ID if provided (for WhatsApp template messages)
    if (config.whatsappTemplateId) {
      params.append("template_id", config.whatsappTemplateId);
    }

    const response = await axios.get(`${url}?${params.toString()}`, {
      timeout: 10000,
    });

    // MSG91 returns request ID on success
    if (response.data && typeof response.data === "string") {
      const requestId = response.data.trim();
      if (requestId && !requestId.toLowerCase().includes("error")) {
        logger.info(`WhatsApp sent via MSG91: requestId=${requestId} to=${phone}`);
        return true;
      }
    }

    logger.error("MSG91 WhatsApp failed:", response.data);
    return false;
  } catch (error: any) {
    logger.error("Failed to send WhatsApp via MSG91:", {
      message: error?.message || String(error),
      response: error?.response?.data,
    });
    return false;
  }
}
