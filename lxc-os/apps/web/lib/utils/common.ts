import crypto from "crypto";
import { CONFIG } from "@/lib/config";

interface ErrorObj {
  error: boolean;
  message: string;
}

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;

  const errorObj = error as ErrorObj;

  if (errorObj && errorObj.message) return errorObj.message;

  return String(error);
};

export const getErrorStack = (error: unknown) => {
  if (error instanceof Error) return error.stack ? error.stack : error.toString();
  return String(error);
};

export const sha512 = (stringToHash: string) => crypto.createHash("sha512").update(stringToHash).digest("hex");

export const getNickName = (firstname: string, lastname: string) => {
  let nickname = "";
  if (firstname) {
    nickname = `${firstname.toLowerCase()}`;
  }
  if (lastname) {
    nickname += `_${lastname.toLowerCase()}`;
  }

  return nickname;
};

// Adapted for Next.js Request
export const getIpAddress = (req: any) => {
  let ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
  
  // Handle array case for x-forwarded-for
  if (Array.isArray(ip)) ip = ip[0];

  if (CONFIG.IS_DEVELOPMENT) {
    ip = "127.0.0.1";
  }

  return ip;
};

export const generateOTP = async () => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};
