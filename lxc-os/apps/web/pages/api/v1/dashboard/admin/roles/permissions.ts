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

  if (req.method === "POST") {
    try {
      const { userId, permissions } = req.body;

      if (!userId || !Array.isArray(permissions)) {
        return res.status(400).json({ error: "Invalid request data. userId and permissions array are required." });
      }

      // We should probably verify that the userId belongs to the same school
      // but the service uses prisma transaction which is safe.
      // However, extra check is good.
      
      const targetUser = await RolePermissionService.getSharableUsers(user.schoolId);
      if (!targetUser.some(u => u.id === userId)) {
        return res.status(403).json({ error: "Unauthorized: User does not belong to your school" });
      }

      const result = await RolePermissionService.updateUserPermissions(userId, permissions);

      return res.status(200).json({ message: "Permissions updated successfully", result });
    } catch (error: any) {
      console.error("Update Permissions Error:", error);
      return res.status(500).json({ error: "Failed to update permissions" });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
