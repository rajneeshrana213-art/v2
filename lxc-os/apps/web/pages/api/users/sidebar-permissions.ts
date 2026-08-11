import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getSidebarPermissions } from "@/lib/services/user-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    res.setHeader("Cache-Control", "private, max-age=60");

    const sidebarPermissions = await getSidebarPermissions(user.id);
    
    res.status(200).json({ success: "ok", ...sidebarPermissions });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
