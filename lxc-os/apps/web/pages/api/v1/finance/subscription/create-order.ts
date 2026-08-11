/**
 * This endpoint previously handled both plan and feature payments.
 * It is now deprecated in favour of:
 *  - /api/v1/finance/subscription/create-plan-order
 *  - /api/v1/finance/subscription/create-feature-order
 *
 * Keeping it as a thin shim for backward compatibility.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "../../../../../lib/middleware/cors";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  await cors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(410).json({
    message:
      "This endpoint is deprecated. Please use /api/v1/finance/subscription/create-plan-order or /api/v1/finance/subscription/create-feature-order.",
  });
}
