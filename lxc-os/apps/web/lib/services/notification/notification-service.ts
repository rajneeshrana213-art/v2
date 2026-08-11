import { replacePlaceholders } from "../../utils/template-engine";
import { sendEmail } from "./email-service";
import { sendSMS } from "./sms-service";
import { sendWhatsApp } from "./whatsapp-service";
import {
  NotificationType,
  NotificationStatus,
  NotificationTrigger,
} from "@prisma/client";
import { prisma } from "../../prisma";
import { CONFIG } from "../../config";

const DEFAULT_TEMPLATES: Record<
  string,
  { name: string; content: string; type: NotificationType }
> = {
  [NotificationTrigger.STUDENT_REGISTRATION]: {
    name: "User Registration Credentials",
    type: NotificationType.EMAIL,
    content: `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eef1f6">
  <tr>
    <td align="center" style="padding: 50px 15px;">
      <table width="620" cellpadding="0" cellspacing="0" border="0"
        style="background: #ffffff; border-radius: 22px; box-shadow: 0 30px 60px rgba(0,0,0,0.12); overflow: hidden;">

        <!-- HERO HEADER -->
        <tr>
          <td align="center" style="padding: 55px 40px; background: radial-gradient(circle at top, #3a7bd5, #1e3c72);">
            <h1 style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">
              Welcome to LearnXChain
            </h1>
            <p style="margin: 14px 0 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 17px; color: #dfe9ff; max-width: 480px;">
              Your student account has been created successfully
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding: 50px 50px;">
            <p style="margin: 0 0 20px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; color: #222;">
              Dear <strong>{{name}}</strong>,
            </p>
            <p style="margin: 0 0 20px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; color: #555; line-height: 1.75;">
              Congratulations! 🎉 Your account has been successfully created on LearnXChain. You can now access your dashboard and start your learning journey.
            </p>
            <p style="margin: 0 0 32px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; color: #555;">
              Below are your secure login credentials:
            </p>

            <!-- CREDENTIAL GLASS CARD -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background: linear-gradient(145deg, #f9fbff, #f1f5ff); border-radius: 18px; border: 1px solid #e3e9f5; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8); margin-bottom: 38px;">
              <tr>
                <td style="padding: 30px 35px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%">
                        <p style="margin: 0 0 8px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; color: #777;">Username</p>
                        <p style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; font-weight: 600; color: #333;">{{userName}}</p>
                      </td>
                      <td width="50%">
                        <p style="margin: 0 0 8px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; color: #777;">Role</p>
                        <p style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; font-weight: 600; color: #333;">{{role}}</p>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top: 25px;">
                        <p style="margin: 0 0 8px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; color: #777;">Temporary Password</p>
                        <p style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 20px; font-weight: 800; letter-spacing: 1px; color: #2a5298;">{{password}}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- LOGIN BUTTON -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 38px;">
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #3a7bd5, #1e3c72); border-radius: 12px; padding: 16px 40px;">
                  <a href="${CONFIG.FRONTEND_BASE_URL}/login" style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                    Login to Dashboard
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin: 0 0 10px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 14px; color: #888; line-height: 1.6;">
              🔒 For security reasons, please change your password after your first login.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding: 25px 50px; background: #f8faff; border-top: 1px solid #e8eef8;">
            <p style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 12px; color: #aaa; text-align: center; line-height: 1.6;">
              This is an automated message from LearnXChain. Please do not reply to this email.<br/>
              © LearnXChain — Empowering Education
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
    `,
  },
  [NotificationTrigger.TEACHER_REGISTRATION]: {
    name: "Staff Account Credentials",
    type: NotificationType.EMAIL,
    content: `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eef1f6">
  <tr>
    <td align="center" style="padding: 50px 15px;">
      <table width="620" cellpadding="0" cellspacing="0" border="0"
        style="background: #ffffff; border-radius: 22px; box-shadow: 0 30px 60px rgba(0,0,0,0.12); overflow: hidden;">

        <!-- HERO HEADER -->
        <tr>
          <td align="center" style="padding: 55px 40px; background: radial-gradient(circle at top, #3a7bd5, #1e3c72);">
            <h1 style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">
              Welcome to LearnXChain
            </h1>
            <p style="margin: 14px 0 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 17px; color: #dfe9ff; max-width: 480px;">
              Your staff account has been created successfully
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding: 50px 50px;">
            <p style="margin: 0 0 20px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; color: #222;">
              Dear <strong>{{name}}</strong>,
            </p>
            <p style="margin: 0 0 20px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; color: #555; line-height: 1.75;">
              Congratulations! 🎉 Your staff account has been successfully registered on LearnXChain. You can now access your dashboard and start managing your responsibilities.
            </p>
            <p style="margin: 0 0 32px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; color: #555;">
              Below are your secure login credentials:
            </p>

            <!-- CREDENTIAL GLASS CARD -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background: linear-gradient(145deg, #f9fbff, #f1f5ff); border-radius: 18px; border: 1px solid #e3e9f5; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8); margin-bottom: 38px;">
              <tr>
                <td style="padding: 30px 35px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%">
                        <p style="margin: 0 0 8px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; color: #777;">Username</p>
                        <p style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; font-weight: 600; color: #333;">{{userName}}</p>
                      </td>
                      <td width="50%">
                        <p style="margin: 0 0 8px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; color: #777;">Role</p>
                        <p style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; font-weight: 600; color: #333;">{{role}}</p>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top: 25px;">
                        <p style="margin: 0 0 8px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; color: #777;">Temporary Password</p>
                        <p style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 20px; font-weight: 800; letter-spacing: 1px; color: #2a5298;">{{password}}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- LOGIN BUTTON -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 38px;">
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #3a7bd5, #1e3c72); border-radius: 12px; padding: 16px 40px;">
                  <a href="${CONFIG.FRONTEND_BASE_URL}/login" style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                    Access Dashboard
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin: 0 0 10px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 14px; color: #888; line-height: 1.6;">
              🔒 For security reasons, please change your password after your first login.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding: 25px 50px; background: #f8faff; border-top: 1px solid #e8eef8;">
            <p style="margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 12px; color: #aaa; text-align: center; line-height: 1.6;">
              This is an automated message from LearnXChain. Please do not reply to this email.<br/>
              © LearnXChain — Empowering Education
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
    `,
  },
};

const SYSTEM_DEFAULT_EMAIL_CONFIG = {
  sender:
    process.env.EMAIL_FROM ||
    process.env.EMAIL_SERVER_USER ||
    "noreply@learnxchain.io",
  user: process.env.EMAIL_SERVER_USER,
  password: process.env.EMAIL_SERVER_PASSWORD,
};

interface SendManualInput {
  templateId: string;
  recipients: string[];
  data: Record<string, any>;
  userId: string;
  schoolId: string;
}

export async function sendManualNotification(input: SendManualInput) {
  const template = await (async () => {
    const dbTemplate = await prisma.notificationTemplate.findFirst({
      where: {
        id: input.templateId,
        OR: [{ schoolId: input.schoolId }, { schoolId: null }],
      },
    });
    if (dbTemplate) return dbTemplate;

    // Fallback to DEFAULT_TEMPLATES if not in DB
    if (input.templateId.startsWith("default-")) {
      const trigger = input.templateId.replace(
        "default-",
        "",
      ) as NotificationTrigger;
      if (DEFAULT_TEMPLATES[trigger]) {
        return {
          ...DEFAULT_TEMPLATES[trigger],
          id: input.templateId,
          schoolId: null,
        } as any;
      }
    }
    return null;
  })();

  if (!template) throw new Error(`Template not found: ${input.templateId}`);

  const message = replacePlaceholders(template.content, input.data);

  let channel = await prisma.notificationChannel.findFirst({
    where: {
      schoolId: input.schoolId,
      type: template.type,
      isActive: true,
    },
  });

  // Fallback to system default if no channel found
  const channelConfig =
    channel?.config ||
    (template.type === NotificationType.EMAIL
      ? SYSTEM_DEFAULT_EMAIL_CONFIG
      : null);
  const provider = channel?.provider || "SYSTEM_DEFAULT";

  if (!channelConfig && template.type === NotificationType.EMAIL) {
    console.warn(
      `No active channel or system default for ${template.type} at school ${input.schoolId}`,
    );
    return;
  }

  await Promise.allSettled(
    input.recipients.map(async (recipient) => {
      try {
        if (template.type === NotificationType.EMAIL) {
          await sendEmail({
            to: recipient,
            subject: template.name,
            html: message,
            config: channelConfig as any,
          });
        } else if (template.type === NotificationType.SMS && channelConfig) {
          await sendSMS(recipient, message, channelConfig as any);
        } else if (
          template.type === NotificationType.WHATSAPP &&
          channelConfig
        ) {
          await sendWhatsApp(recipient, message, channelConfig as any);
        }
        await prisma.notificationLog.create({
          data: {
            recipient,
            type: template.type,
            message,
            status: NotificationStatus.SENT,
            channelUsed: provider,
            schoolId: input.schoolId,
            sentBy: input.userId,
          },
        });
      } catch (err) {
        await prisma.notificationLog.create({
          data: {
            recipient,
            type: template.type,
            message,
            status: NotificationStatus.FAILED,
            channelUsed: provider,
            schoolId: input.schoolId,
            sentBy: input.userId,
          },
        });
      }
    }),
  );
}

interface TriggerInput {
  triggerEvent: NotificationTrigger;
  schoolId: string;
  data: Record<string, any>;
}

export async function triggerNotification(input: TriggerInput) {
  let template = await prisma.notificationTemplate.findFirst({
    where: {
      triggerEvent: input.triggerEvent,
      isAutomated: true,
      OR: [{ schoolId: input.schoolId }, { schoolId: null }],
    },
  });

  // Use default template if not found in DB
  if (!template && DEFAULT_TEMPLATES[input.triggerEvent]) {
    template = {
      ...DEFAULT_TEMPLATES[input.triggerEvent],
      id: `default-${input.triggerEvent}`,
      schoolId: null,
      isAutomated: true,
      triggerEvent: input.triggerEvent,
      createdBy: "system",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }

  if (!template) return;

  // Safe audit log creation
  try {
    await prisma.triggerNotification.create({
      data: {
        triggerEvent: input.triggerEvent,
        schoolId: input.schoolId,
        data: input.data,
      },
    });
  } catch (error) {
    console.warn("Failed to create trigger notification audit log:", error);
    // Continue anyway - don't let audit logging block the actual notification
  }

  await sendManualNotification({
    templateId: template.id,
    recipients: [input.data.recipient],
    data: input.data,
    userId: "system",
    schoolId: input.schoolId,
  });
}
