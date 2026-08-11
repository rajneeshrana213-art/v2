import winston from "winston";
import path from "path";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "info";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Ensure logs directory exists or use tmp?
// For Vercel/Serverless, writing to filesystem is ephemeral.
// We will stick to Console for production mostly, but keep file for local.

import { sendErrorToAdmin } from "./error-notifier";

const format = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info: any) => {
    if (info.stack) {
      return `${info.timestamp} ${info.level}: ${info.message} - ${info.stack}`;
    } else {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    }
  }),
);

// State for rate limiting error emails
let lastEmailSentAt = 0;
let emailCountInWindow = 0;
const EMAIL_RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_EMAILS_PER_WINDOW = 5;
let isSendingEmail = false;

// Custom Transport to send emails for Errors
class EmailTransport extends winston.transports.Console {
  log(info: any, callback: any) {
    if (info.level === "error" || info.level.includes("error")) {
      const msgStr =
        typeof info.message === "string"
          ? info.message
          : String(info.message || "");

      const isEmailRelated =
        msgStr.includes("[ErrorNotifier]") ||
        msgStr.includes("[EmailService]") ||
        msgStr.includes("sendMail error") ||
        msgStr.includes("EAUTH") ||
        msgStr.includes("gsmtp");

      if (!isEmailRelated && !msgStr.includes("[Bulk Upload]") && !isSendingEmail) {
        // Rate limiting check
        const now = Date.now();
        if (now - lastEmailSentAt > EMAIL_RATE_LIMIT_WINDOW_MS) {
          lastEmailSentAt = now;
          emailCountInWindow = 1;
        } else {
          emailCountInWindow++;
        }

        if (emailCountInWindow <= MAX_EMAILS_PER_WINDOW) {
          const error =
            info instanceof Error
              ? info
              : new Error(info.message || "Unknown Backend Error");
          if (info.stack) error.stack = info.stack;

          // Re-entry guard
          isSendingEmail = true;

          // Fire and forget email notification
          sendErrorToAdmin(error, {
            level: info.level,
            timestamp: info.timestamp,
            ...info,
          })
            .catch((err) => {
              if (process.stderr) {
                process.stderr.write(`❌ [EmailTransport] Failed: ${err}\n`);
              }
            })
            .finally(() => {
              isSendingEmail = false;
            });
        } else if (emailCountInWindow === MAX_EMAILS_PER_WINDOW + 1) {
          if (process.stderr) {
            process.stderr.write(
              "⚠️ [EmailTransport] Rate limit exceeded. Silencing error emails for 1 minute.\n",
            );
          }
        }
      }
    }
    if (super.log) {
      super.log(info, callback);
    } else {
      callback();
    }
  }
}

// In-Memory Transport to capture logs for the Super Admin dashboard
const globalForLogs = globalThis as unknown as {
  recentMemoryLogs: any[];
  slowApiRequests: any[];
};

export const recentMemoryLogs: any[] = globalForLogs.recentMemoryLogs || [];
globalForLogs.recentMemoryLogs = recentMemoryLogs;

// Slow API requests store (threshold: 300ms)
export const SLOW_API_THRESHOLD_MS = 300;
export const MAX_SLOW_API_ENTRIES = 50;
export const slowApiRequests: any[] = globalForLogs.slowApiRequests || [];
globalForLogs.slowApiRequests = slowApiRequests;

const MAX_LOGS = 50;

class InMemoryTransport extends winston.transports.Console {
  log(info: any, callback: any) {
    if (info) {
      const logEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: info.timestamp || new Date(),
        level: info.level.includes("error")
          ? "error"
          : info.level.includes("warn")
            ? "warning"
            : "info",
        message: info.message || "",
        source: info.source || "Vercel App",
      };

      recentMemoryLogs.unshift(logEntry);
      if (recentMemoryLogs.length > MAX_LOGS) {
        recentMemoryLogs.pop();
      }
    }

    if (super.log) {
      super.log(info, callback);
    } else {
      callback();
    }
  }
}

const transports: winston.transport[] = [
  new winston.transports.Console(),
  new EmailTransport(),
  new InMemoryTransport(),
];

// Only add file transports if running locally/persistent fs
if (process.env.NODE_ENV === "development") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.uncolorize(),
    }),
  );
  transports.push(
    new winston.transports.File({
      format: winston.format.uncolorize(),
      filename: "logs/all.log",
    }),
  );
}

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default Logger;

// Override native console methods to also push to Winston and our InMemoryTransport
if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;

  console.log = (...args) => {
    Logger.info(
      args
        .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
        .join(" "),
    );
    originalConsoleLog.apply(console, args);
  };

  console.error = (...args) => {
    Logger.error(
      args
        .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
        .join(" "),
    );
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    Logger.warn(
      args
        .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
        .join(" "),
    );
    originalConsoleWarn.apply(console, args);
  };

  console.info = (...args) => {
    Logger.info(
      args
        .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
        .join(" "),
    );
    originalConsoleInfo.apply(console, args);
  };
}

// Wrapper for API routes to automatically log requests and catch errors
import type { NextApiRequest, NextApiResponse } from "next";

export function withApiLogger(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any> | any,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    try {
      await handler(req, res);
      const duration = Date.now() - start;
      Logger.info(`[PERF][API] ${req.method} ${req.url} - ${duration}ms`);
      if (duration >= SLOW_API_THRESHOLD_MS) {
        const entry = {
          id: `api-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          method: req.method || "GET",
          url: req.url || "",
          duration,
          timestamp: new Date().toISOString(),
          status: res.statusCode,
        };
        slowApiRequests.unshift(entry);
        if (slowApiRequests.length > MAX_SLOW_API_ENTRIES) {
          slowApiRequests.pop();
        }
        Logger.warn(
          `[PERF][API] SLOW ${req.method} ${req.url} - ${duration}ms (exceeded ${SLOW_API_THRESHOLD_MS}ms threshold)`,
        );
      }
    } catch (error: any) {
      const duration = Date.now() - start;
      console.error(
        `[API ERROR] ${req.method} ${req.url} - ${error.message} (${duration}ms)`,
        error.stack,
      );
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}
