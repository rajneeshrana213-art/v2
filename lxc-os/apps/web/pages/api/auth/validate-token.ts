import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { CONFIG } from "@/lib/config";

/**
 * GET /api/auth/validate-token
 *
 * Lightweight endpoint used by the mobile app splash screen to verify
 * that a stored Bearer token is still valid (not expired, not tampered).
 *
 * Does NOT require a DB round-trip — JWT self-validates cryptographically.
 * Returns 200 + decoded payload on success, 401 on failure.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, CONFIG.JWT_ACCESS_TOKEN_SECRET) as any;
    return res.status(200).json({
      valid: true,
      userId: decoded.userId || decoded.id,
      role: decoded.role,
      schoolId: decoded.schoolId,
    });
  } catch (err: any) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid token";
    return res.status(401).json({ error: `Unauthorized: ${message}` });
  }
}
