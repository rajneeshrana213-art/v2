/**
 * Notification Helper Service
 * Centralized notification service for various events
 */

import { prisma } from "../../prisma";
import { sendWhatsApp } from "./whatsapp-service";
import { sendSMS } from "./sms-service";
import { MSG91Config } from "./msg91-service";
import { getTemplateIds, NotificationEventType } from "./msg91-template-service";
import logger from "../../utils/logger";

/**
 * Get MSG91 config from environment variables
 * (Replicated from legacy msg91Service)
 */
function getEnvMSG91Config(): MSG91Config {
  return {
    authKey: process.env.MSG91_AUTH_KEY || "",
    senderId: process.env.MSG91_SENDER_ID || "",
    route: process.env.MSG91_ROUTE || "4", // Default to transactional
    country: process.env.MSG91_COUNTRY || "91", 
    smsTemplateId: process.env.MSG91_SMS_TEMPLATE_ID,
    whatsappTemplateId: process.env.MSG91_WHATSAPP_TEMPLATE_ID,
  };
}

/**
 * Get MSG91 config from environment and merge with template IDs
 */
async function getConfig(eventType: NotificationEventType, schoolId?: string) {
  const baseConfig = getEnvMSG91Config();
  const templateIds = await getTemplateIds(eventType, schoolId);

  return {
    ...baseConfig,
    smsTemplateId: templateIds.smsTemplateId || baseConfig.smsTemplateId,
    whatsappTemplateId: templateIds.whatsappTemplateId || baseConfig.whatsappTemplateId,
  };
}

/**
 * Send notification to student/parent (both WhatsApp and SMS)
 */
async function sendStudentNotification(
  phone: string | null | undefined,
  message: string,
  eventType: NotificationEventType,
  schoolId?: string
): Promise<boolean> {
  if (!phone) {
    return false;
  }

  const config = await getConfig(eventType, schoolId);
  if (!config.authKey || !config.senderId) {
    logger.warn("MSG91 not configured, skipping notification");
    return false;
  }

  try {
    const results = await Promise.allSettled([sendWhatsApp(phone, message, config), sendSMS(phone, message, config)]);

    const whatsappSuccess = results[0].status === "fulfilled";
    const smsSuccess = results[1].status === "fulfilled";

    return whatsappSuccess || smsSuccess;
  } catch (error) {
    logger.error("Failed to send student notification:", error);
    return false;
  }
}

/**
 * Send homework assigned notification
 */
export async function notifyHomeworkAssigned(homeworkId: string): Promise<void> {
  try {
    const homework = await prisma.homeWork.findUnique({
      where: { id: homeworkId },
      include: {
        class: {
          include: {
            students: {
              include: {
                user: true,
              },
            },
          },
        },
        subject: true,
      },
    });

    if (!homework) {
      return;
    }

    const message = `📚 New Homework Assigned

Subject: ${homework.subject?.name || "N/A"}
Title: ${homework.title}
Due Date: ${new Date(homework.dueDate).toLocaleDateString()}

${homework.description ? `Description: ${homework.description.substring(0, 100)}${homework.description.length > 100 ? "..." : ""}` : ""}

Please complete and submit before the due date.`;

    // Send to all students in the class
    for (const student of homework.class.students) {
      const phone = student.guardianPhone || student.user?.phone;
      if (phone) {
        await sendStudentNotification(phone, message, NotificationEventType.HOMEWORK_ASSIGNED, homework.class.schoolId);
      }
    }

    logger.info(`Homework assigned notifications sent for homework ${homeworkId}`);
  } catch (error) {
    logger.error("Failed to send homework assigned notification:", error);
  }
}

/**
 * Send exam created/published notification
 */
export async function notifyExamCreated(examId: string): Promise<void> {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: {
          include: {
            students: {
              include: {
                user: true,
              },
            },
          },
        },
        subject: true,
      },
    });

    if (!exam) {
      return;
    }

    const examDate = exam.scheduleDate || exam.startTime;
    const message = `📝 Exam Scheduled

Subject: ${exam.subject?.name || "N/A"}
Exam: ${exam.title}
Date: ${new Date(examDate).toLocaleDateString()}
Time: ${new Date(exam.startTime).toLocaleTimeString()} - ${new Date(exam.endTime).toLocaleTimeString()}
${exam.totalMarks ? `Total Marks: ${exam.totalMarks}` : ""}
${exam.roomNumber ? `Room: ${exam.roomNumber}` : ""}

Please prepare accordingly.`;

    // Send to all students in the class
    for (const student of exam.class.students) {
      const phone = student.guardianPhone || student.user?.phone;
      if (phone) {
        await sendStudentNotification(phone, message, NotificationEventType.EXAM_CREATED, exam.class.schoolId);
      }
    }

    logger.info(`Exam created notifications sent for exam ${examId}`);
  } catch (error) {
    logger.error("Failed to send exam created notification:", error);
  }
}

/**
 * Send result published notification
 */
export async function notifyResultPublished(resultId: string): Promise<void> {
  try {
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        exam: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!result || !result.student) {
      return;
    }

    const phone = result.student.guardianPhone || result.student.user?.phone;
    if (!phone) {
      return;
    }

    const exam = result.exam;
    const totalMarks = exam?.totalMarks || 0;
    const percentage = totalMarks > 0 ? ((result.score / totalMarks) * 100).toFixed(2) : "0";

    const message = `📊 Result Published

Student: ${result.student.user?.name || "Student"}
Subject: ${exam?.subject?.name || "N/A"}
Exam: ${exam?.title || "N/A"}
Marks Obtained: ${result.score}${totalMarks > 0 ? ` / ${totalMarks}` : ""}
Percentage: ${percentage}%

${totalMarks > 0 && exam?.passMark ? `Pass Marks: ${exam.passMark}` : ""}

Keep up the good work!`;

    await sendStudentNotification(phone, message, NotificationEventType.RESULT_PUBLISHED, result.student.schoolId);
    logger.info(`Result published notification sent for result ${resultId}`);
  } catch (error) {
    logger.error("Failed to send result published notification:", error);
  }
}

/**
 * Send notice published notification
 */
export async function notifyNoticePublished(noticeId: string): Promise<void> {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
      include: {
        recipients: true,
        school: true,
      },
    });

    if (!notice) {
      return;
    }

    // Get all users based on recipient types
    const recipientTypes = notice.recipients.map((r) => r.userType);

    // Get students and parents
    const students = await prisma.student.findMany({
      where: {
        schoolId: notice.schoolId,
        ...(recipientTypes.includes("STUDENT") || recipientTypes.includes("PARENT") ? {} : { id: "none" }), // Empty result if not needed
      },
      include: {
        user: true,
      },
    });

    const message = `📢 Notice from ${notice.school?.schoolName || "School"}

Title: ${notice.title}

${notice.message.substring(0, 200)}${notice.message.length > 200 ? "..." : ""}

Published: ${new Date(notice.publishDate).toLocaleDateString()}`;

    // Send to students/parents
    if (recipientTypes.includes("STUDENT") || recipientTypes.includes("PARENT")) {
      for (const student of students) {
        const phone = student.guardianPhone || student.user?.phone;
        if (phone) {
          await sendStudentNotification(phone, message, NotificationEventType.NOTICE_PUBLISHED, notice.schoolId);
        }
      }
    }

    // Send to teachers if needed
    if (recipientTypes.includes("TEACHER")) {
      const teachers = await prisma.teacher.findMany({
        where: { schoolId: notice.schoolId },
        include: { user: true },
      });

      for (const teacher of teachers) {
        const phone = teacher.user?.phone;
        if (phone) {
          await sendStudentNotification(phone, message, NotificationEventType.NOTICE_PUBLISHED, notice.schoolId);
        }
      }
    }

    logger.info(`Notice published notifications sent for notice ${noticeId}`);
  } catch (error) {
    logger.error("Failed to send notice published notification:", error);
  }
}
