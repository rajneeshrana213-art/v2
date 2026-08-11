import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { RolePermissionService } from "@/lib/services/admin/core/RolePermissionService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  if (req.method === "GET") {
    try {
      const users = await RolePermissionService.getSharableUsers(user.schoolId);
      return res.status(200).json(users);
    } catch (error: any) {
      console.error("Fetch Roles Users Error:", error);
      return res.status(500).json({ error: "Failed to fetch users for role management" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
