import ejs from "ejs";
import { SendMailOptions } from "nodemailer";
import nodemailer from "nodemailer";
import path from "path";

import { CONFIG } from "@/lib/config";
import Logger from "./logger";
import EmailChecker from "./emailChecker";
import { getErrorMessage, getErrorStack } from "./common";
// import { prisma } from "@/lib/prisma";

const GMAIL_USER =
  CONFIG.EMAIL_AUTH_USERNAME ||
  process.env.EMAIL_AUTH_USERNAME ||
  process.env.EMAIL_SERVER_USER ||
  process.env.EMAIL_USER ||
  "";
const GMAIL_PASS =
  CONFIG.EMAIL_AUTH_PASSWORD ||
  process.env.EMAIL_AUTH_PASSWORD ||
  process.env.EMAIL_SERVER_PASSWORD ||
  process.env.EMAIL_PASSWORD ||
  "";
const GMAIL_HOST = "smtp.gmail.com";
const GMAIL_PORT = 587;

let cachedTransporter: nodemailer.Transporter | null = null;

const createGoogleSMTPTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  if (!GMAIL_USER || !GMAIL_PASS) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: GMAIL_HOST,
    port: GMAIL_PORT,
    secure: false,
    pool: true, // Enable pooling
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 2000,
    rateLimit: 1,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000, // Increased to 30s
    socketTimeout: 30000, // Increased to 30s
    greetingTimeout: 30000,
  });

  return cachedTransporter;
};

export const sendMail = async (
  htmlEmailContent: string,
  receiver: string,
  subject: string,
  mailOptions: SendMailOptions = {},
) => {
  if (CONFIG.IS_DEVELOPMENT && (!GMAIL_USER || !GMAIL_PASS)) {
    Logger.info(`Email skipped (dev): ${receiver} - ${subject}`);
    return { messageId: `dev-${Date.now()}` };
  }

  const transporter = createGoogleSMTPTransporter();
  if (!transporter) {
    const errMsg = "Google SMTP not configured.";
    Logger.error("[EmailService] sendMail error: " + errMsg);
    throw new Error(errMsg);
  }

  try {
    const from = `${CONFIG.EMAIL_FROM_NAME || "LearnXChain"} <${CONFIG.EMAIL_FROM_EMAIL || process.env.EMAIL_FROM_EMAIL || CONFIG.SUPPORT_EMAIL || "no-reply@learnxchain.io"}>`;

    const mailData: SendMailOptions = {
      from,
      to: receiver,
      subject,
      html: htmlEmailContent,
      ...mailOptions, // Spread any additional options (attachments, etc.)
    };

    const response = await transporter.sendMail(mailData);
    const messageId = response.messageId || `gmail-${Date.now()}`;

    return { messageId };
  } catch (err) {
    Logger.error("[EmailService] sendMail error: " + getErrorMessage(err));
    throw err;
  }
};

export const renderAndSendEmail = async (
  templateName: string,
  templateData: { [key: string]: any },
  emailSubject: string,
  emailTo: string,
  mailOptions: SendMailOptions = {},
): Promise<boolean> => {
  let emailContent: string;
  try {
    // START CHANGE: Use process.cwd() to locate templates
    const templatePath = path.join(
      process.cwd(),
      "lib/templates",
      `${templateName}.ejs`,
    );
    emailContent = (await ejs.renderFile(templatePath, {
      ...templateData,
      imageBaseUrl: CONFIG.EMAIL_IMAGE_BASE_URL,
      teamName: CONFIG.TEAM_NAME,
    })) as string;
  } catch (renderErr) {
    Logger.error(
      `[EmailService] renderAndSendEmail: template render failed for ${templateName}`,
      renderErr,
    );
    return false;
  }

  let content: string;
  try {
    const mainTemplatePath = path.join(
      process.cwd(),
      "lib/templates",
      "main.ejs",
    );
    content = (await ejs.renderFile(mainTemplatePath, {
      content: emailContent,
      subject: emailSubject,
      imageBaseUrl: CONFIG.EMAIL_IMAGE_BASE_URL,
    })) as string;
  } catch (wrapErr) {
    Logger.error(
      `[EmailService] renderAndSendEmail: main template render failed for ${templateName}`,
      wrapErr,
    );
    return false;
  }

  try {
    await sendMail(content, emailTo, emailSubject, mailOptions);
    return true;
  } catch (error) {
    Logger.error(
      `[EmailService] renderAndSendEmail: sendMail failed for ${templateName}`,
      error,
    );
    return false;
  }
};

export const sendErrorMessageToSupport = (
  message: string,
  subject: string = "Error Occurred",
  extraData: string = "",
) => {
  renderAndSendEmail(
    "error",
    {
      error: message,
      extraData: extraData,
    },
    subject,
    CONFIG.SUPPORT_EMAIL,
  ).catch((error) => {
    Logger.error("[EmailService] " + getErrorMessage(error));
  });
};

export const sendInvoiceEmail = async (
  emailTo: string,
  invoiceNumber: string,
  amount: number,
) => {
  try {
    await renderAndSendEmail(
      "invoice",
      {
        invoiceNumber,
        amount,
        date: new Date().toLocaleDateString(),
      },
      `Invoice ${invoiceNumber}`,
      emailTo,
    );
  } catch (err) {
    Logger.error("[EmailService] sendInvoiceEmail failed: " + getErrorMessage(err));
    throw err;
  }
};

export const sendInvoicePdfEmail = async (
  emailTo: string,
  invoiceUrl: string,
  pdfBuffer?: Buffer,
  invoiceNumber?: string,
) => {
  const attachment = pdfBuffer
    ? { filename: "invoice.pdf", content: pdfBuffer }
    : { filename: "invoice.pdf", path: invoiceUrl };

  try {
    await renderAndSendEmail(
      "invoice-pdf",
      {
        invoiceNumber: invoiceNumber || "",
        invoiceUrl: invoiceUrl || "",
      },
      "Invoice",
      emailTo,
      { attachments: [attachment] },
    );
  } catch (err) {
    Logger.error("[EmailService] sendInvoicePdfEmail failed: " + getErrorMessage(err));
  }
};

