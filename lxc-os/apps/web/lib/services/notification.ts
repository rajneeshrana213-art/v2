import twilio from "twilio";
import { CONFIG } from "@/lib/config";
import Logger from "@/lib/utils/logger";
import { sendEmail as sendEmailViaGoogleSMTP } from "@/lib/services/emailService";

// Load env (only Twilio vars needed here)
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_MESSAGING_SERVICE_SID } = process.env as {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  TWILIO_MESSAGING_SERVICE_SID?: string;
};

// Twilio setup
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const DEFAULT_FROM = CONFIG.EMAIL_FROM_EMAIL || process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_SERVER_USER || CONFIG.SUPPORT_EMAIL || "no-reply@learnxchain.io";

function formatPhone(phone: string): string {
  let formatted = phone.trim();
  if (formatted.startsWith("0")) {
    formatted = formatted.replace(/^0+/, "");
  }
  const digitsOnly = formatted.replace(/[^0-9]/g, "");

  if (!formatted.startsWith("+")) {
    if (digitsOnly.length === 10) {
      formatted = `+91${digitsOnly}`;
    } else if (digitsOnly.length > 0) {
      formatted = `+${digitsOnly}`;
    }
  }

  const e164 = formatted.replace(/[^+0-9]/g, "");
  return e164;
}

function isE164(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

// Send SMS
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    Logger.error(`Twilio credentials missing.`);
    return false;
  }

  const to = formatPhone(phone);
  if (!isE164(to)) {
    Logger.error(`sendSMS aborted: recipient phone is not in E.164 format: ${to}`);
    return false;
  }

  if (!TWILIO_MESSAGING_SERVICE_SID && !TWILIO_PHONE_NUMBER) {
    Logger.error(
      `Twilio sender not configured.`
    );
    return false;
  }

  try {
    const payload: any = {
      body: message,
      to,
    };

    if (TWILIO_MESSAGING_SERVICE_SID) {
      payload.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
    } else {
      payload.from = TWILIO_PHONE_NUMBER;
    }

    const msg = await twilioClient.messages.create(payload);
    Logger.info(`SMS sent: sid=${msg.sid} to=${to}`);
    return true;
  } catch (error) {
    const err = error as any;
    Logger.error("Failed to send SMS:", {
      message: err?.message || String(err),
      code: err?.code,
    });
    return false;
  }
}

// Send Email
export async function sendEmail(to: string | undefined | null, subject: string, body: string): Promise<boolean> {
  if (CONFIG.IS_DEVELOPMENT) {
    Logger.info(`Email skipped (dev): ${to} - ${subject}`);
    return false;
  }

  if (!to) {
    Logger.error("Failed to send email: no recipient");
    return false;
  }

  try {
    await sendEmailViaGoogleSMTP({
      to: to,
      subject,
      html: body,
      config: { sender: DEFAULT_FROM }
    });
    Logger.info(`Email sent via Google SMTP: ${to}`);
    return true;
  } catch (error) {
    Logger.error("Failed to send email:", error);
    return false;
  }
}
