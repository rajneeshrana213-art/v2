import { CONFIG } from "@/lib/config";
import Logger from "./logger";

type EmailConfigStatus = {
  gmailAuthConfigured: boolean;
  smtpConfigured: boolean;
  notificationModuleConfigured: boolean;
  details: { [k: string]: string };
};

const mask = (val?: string) => {
  if (!val) return "(not set)";
  if (val.length <= 4) return "****";
  return val.slice(0, 2) + "****" + val.slice(-2);
};

export const getEmailConfigStatus = (): EmailConfigStatus => {
  const gmailUser = CONFIG.EMAIL_AUTH_USERNAME || process.env.EMAIL_AUTH_USERNAME || "";
  const gmailPass = CONFIG.EMAIL_AUTH_PASSWORD || process.env.EMAIL_AUTH_PASSWORD || "";

  const smtpHost = process.env.EMAIL_SERVER_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
  const smtpPort = process.env.EMAIL_SERVER_PORT || process.env.EMAIL_PORT || "587";
  
  const smtpUser = CONFIG.EMAIL_AUTH_USERNAME || process.env.EMAIL_AUTH_USERNAME || process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER || "";
  const smtpPass = CONFIG.EMAIL_AUTH_PASSWORD || process.env.EMAIL_AUTH_PASSWORD || process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASSWORD || "";

  const notificationUser = process.env.EMAIL_USER || "";
  const notificationPass = process.env.EMAIL_PASS || "";

  const status: EmailConfigStatus = {
    gmailAuthConfigured: !!(gmailUser && gmailPass),
    smtpConfigured: !!(smtpHost && smtpUser && smtpPass),
    notificationModuleConfigured: !!(notificationUser && notificationPass && smtpHost && smtpPort),
    details: {
      EMAIL_AUTH_USERNAME: mask(gmailUser || smtpUser),
      EMAIL_AUTH_PASSWORD: gmailPass ? "(set)" : "(not set)",
      EMAIL_FROM_EMAIL: mask(CONFIG.EMAIL_FROM_EMAIL || process.env.EMAIL_FROM_EMAIL || ""),
      EMAIL_SERVER_HOST: smtpHost || "(not set)",
      EMAIL_SERVER_PORT: smtpPort || "(not set)",
      EMAIL_SERVER_USER: mask(smtpUser),
      EMAIL_SERVER_PASSWORD: smtpPass ? "(set)" : "(not set)",
      NOTIFICATION_EMAIL_USER: mask(notificationUser),
      NOTIFICATION_EMAIL_PASS: notificationPass ? "(set)" : "(not set)",
    },
  };

  return status;
};

export const logEmailConfigStatus = () => {
  const s = getEmailConfigStatus();
  Logger.info("Email configuration summary (Google SMTP):");

  for (const [k, v] of Object.entries(s.details)) {
    Logger.info(`  ${k}: ${v}`);
  }

  if (!s.gmailAuthConfigured && !s.smtpConfigured) {
    Logger.warn(
      "Google SMTP not configured. The app will skip startup SMTP verification. Set EMAIL_AUTH_USERNAME and EMAIL_AUTH_PASSWORD in your .env file to enable email sending."
    );
  }
};

export const hasAuthForTransport = () => {
  return (
    !!(CONFIG.EMAIL_AUTH_USERNAME || process.env.EMAIL_AUTH_USERNAME) &&
    !!(CONFIG.EMAIL_AUTH_PASSWORD || process.env.EMAIL_AUTH_PASSWORD)
  );
};

export default { getEmailConfigStatus, logEmailConfigStatus, hasAuthForTransport };
