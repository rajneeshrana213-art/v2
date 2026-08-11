import { sendEmail } from "@/lib/services/emailService";
import { CONFIG } from "@/lib/config";
import ejs from "ejs";
import fs from "fs";
import path from "path";

const ADMIN_EMAIL = "errorlearnxchain@gmail.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Sends an error report to the admin email using a professional EJS template.
 */
export async function sendErrorToAdmin(error: Error, context?: any) {
  const sender = CONFIG.EMAIL_AUTH_USERNAME || process.env.EMAIL_AUTH_USERNAME || process.env.EMAIL_SERVER_USER || "";

  if (!sender) {
    console.warn("❌ [ErrorNotifier] Email sender not configured. Checked: CONFIG.EMAIL_AUTH_USERNAME, EMAIL_AUTH_USERNAME, EMAIL_SERVER_USER");
    return;
  }

  console.log(`🚀 [ErrorNotifier] Attempting to send error report to ${ADMIN_EMAIL} from ${sender}`);

  const env = process.env.NODE_ENV || "development";
  const timestamp = new Date().toLocaleString();

  const subject = `🚨 [${env.toUpperCase()} ALERT] ${error.message.substring(0, 50)}${error.message.length > 50 ? '...' : ''}`;

  try {
    const templatePath = path.join(process.cwd(), "lib", "templates", "emails", "error-report.ejs");

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found at ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, "utf-8");

    const html = ejs.render(templateContent, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      env,
      timestamp,
      appUrl: APP_URL,
      context: context || {}
    });

    await sendEmail({
      to: ADMIN_EMAIL,
      subject,
      html,
      text: `Error Report: ${error.message}\n\nEnvironment: ${env}\nTimestamp: ${timestamp}\n\nStack Trace:\n${error.stack || "No stack trace available"}`,
      config: { sender }
    });

    console.log("✅ [ErrorNotifier] Error email sent successfully");
  } catch (err: any) {
    if (process.stderr) {
      process.stderr.write(`❌ [ErrorNotifier] Failed to render or send error email: ${err}\n`);
    } else {
      console.warn("❌ [ErrorNotifier] Failed to render or send error email:", err);
    }
  }
}
