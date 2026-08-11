import { timingSafeEqual } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Verifies the cron job secret using a constant-time comparison to prevent
 * timing-based attacks.
 *
 * Usage:
 *   if (!verifyCronSecret(req, res)) return;
 *
 * The caller must send: Authorization: Bearer <CRON_SECRET>
 */
export function verifyCronSecret(req: NextApiRequest, res: NextApiResponse): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn("[CronGuard] CRON_SECRET is not set — all cron requests will be rejected.");
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  const authHeader = req.headers.authorization;
  const expected = `Bearer ${cronSecret}`;

  if (!authHeader || authHeader.length !== expected.length) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  try {
    const match = timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
    if (!match) {
      res.status(401).json({ error: "Unauthorized" });
      return false;
    }
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
}
