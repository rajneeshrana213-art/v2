import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { slowApiRequests, SLOW_API_THRESHOLD_MS } from "@/lib/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden: Super Admin access required" });
  }

  return res.status(200).json({
    slowApiRequests,
    thresholdMs: SLOW_API_THRESHOLD_MS,
    total: slowApiRequests.length,
  });
}
