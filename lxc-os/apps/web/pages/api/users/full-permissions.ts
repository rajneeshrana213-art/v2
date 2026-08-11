import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/services/user-service";
import { Role } from "@prisma/client";

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

    const userPermissions = user.role !== Role.superadmin ? await getUserPermissions(user.id) : {};
    
    res.status(200).json({ success: "ok", ...userPermissions });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
