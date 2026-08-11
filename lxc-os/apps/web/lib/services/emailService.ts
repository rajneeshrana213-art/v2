import { renderAndSendEmail, sendMail } from "@/lib/utils/mailer";

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
    console.error(`❌ [EmailService] error for ${recipients}:`, err);
    throw err;
  }
}

/**
 * Send password reset email with reset link
 */
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    const sent = await renderAndSendEmail(
      "password-reset",
      {
        resetLink,
      },
      "Password Reset Request",
      email,
    );
    if (!sent) {
      throw new Error("Failed to send password reset email");
    }
  } catch (err) {
    console.error("sendPasswordResetEmail failed:", err);
    throw err;
  }
}

/**
 * Send welcome email to new employee with credentials
 */
export async function sendEmployeeWelcomeEmail(
  email: string,
  name: string,
  password: string,
  employeeCode: string,
) {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
    : "http://localhost:3000/login";

  try {
    await renderAndSendEmail(
      "employee-welcome",
      {
        name,
        email,
        password,
        employeeCode,
        loginUrl,
      },
      "Welcome to LearnXChain - Your Account Credentials",
      email,
    );
  } catch (err) {
    console.error("sendEmployeeWelcomeEmail failed:", err);
    throw err;
  }
}

/**
 * Send subscription/billing reminder email to school owner
 */
export async function sendSubscriptionReminder(
  email: string,
  schoolName: string,
  message: string,
) {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
    : "http://localhost:3000/login";

  try {
    await renderAndSendEmail(
      "subscription-reminder",
      {
        schoolName,
        message,
        loginUrl,
      },
      `Subscription Alert: ${schoolName}`,
      email,
    );
  } catch (err) {
    console.error("sendSubscriptionReminder failed:", err);
    throw err;
  }
}

/**
 * Send ticket assignment email to employee
 */
export async function sendTicketAssignmentEmail(
  email: string,
  employeeName: string,
  ticketNumber: string,
  ticketTitle: string,
  ticketPriority: string,
  ticketId: string,
) {
  const dashboardLink = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/employee/support-tickets?ticket=${ticketId}`
    : `http://localhost:3000/dashboard/employee/support-tickets?ticket=${ticketId}`;

  const priorityColors: Record<string, string> = {
    LOW: "#10B981", // Green
    MEDIUM: "#F59E0B", // Amber
    HIGH: "#EF4444", // Red
    URGENT: "#7C3AED", // Purple
  };

  const priorityColor = priorityColors[ticketPriority] || "#6B7280"; // Default gray

  try {
    await renderAndSendEmail(
      "ticket-assignment",
      {
        employeeName,
        ticketNumber,
        ticketTitle,
        ticketPriority,
        priorityColor,
        dashboardLink,
      },
      `New Ticket Assigned: #${ticketNumber}`,
      email,
    );
  } catch (err) {
    console.error("sendTicketAssignmentEmail failed:", err);
    // Don't throw error to prevent blocking the API response
  }
}
