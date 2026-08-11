import { sendMail } from "@/lib/utils/mailer";

interface EmailConfig {
  sender?: string;
  user?: string;
  password?: string;
}

interface Attachment {
  filename: string;
  path?: string;
  content?: string | Buffer;
  contentType?: string;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
  config: EmailConfig;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments,
  config,
}: SendEmailOptions) {
  if (!config || !config.sender) {
    throw new Error("Missing email configuration: sender is required");
  }

  const recipients = Array.isArray(to) ? to : [to];

  try {
    for (const recipient of recipients) {
      await sendMail(html || text || "", recipient, subject, { attachments });
    }
  } catch (err: any) {
    console.error(`[EmailNotificationService] Error for ${recipients}:`, err);
    // Don't throw, just log. We don't want to break the main flow if email fails
  }
}
