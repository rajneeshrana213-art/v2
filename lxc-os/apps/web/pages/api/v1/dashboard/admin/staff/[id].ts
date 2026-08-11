
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { StaffService } from "@/lib/services/admin/core/StaffService";
import { updateStaffSchema } from "@/lib/validations/admin/staff";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid staff ID" });
  }

  const user = (req as any).user;
  if (!user.schoolId && user.role !== "superadmin") {
    console.warn(`[Staff API] User ${user.id} (${user.role}) has no schoolId`);
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  // Verify staff belongs to the same school (skip for superadmin)
  const staffMember = await StaffService.getUserById(id);
  if (!staffMember) {
    return res.status(404).json({ error: "Staff member not found" });
  }

  if (user.role !== "superadmin" && staffMember.schoolId !== user.schoolId) {
    console.warn(`[Staff API] Unauthorized access attempt: User ${user.id} (${user.schoolId}) accessed staff ${id} (${staffMember.schoolId})`);
    return res.status(404).json({ error: "Staff member not found" });
  }

  if (req.method === "GET") {
    try {
      return res.status(200).json({ success: true, data: staffMember });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch staff member" });
    }
  }

  if (req.method === "PUT") {
    try {
      const validatedData = updateStaffSchema.parse(req.body);
      const updated = await StaffService.updateUser(id, validatedData);
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      if (error.name === "ZodError") {
        console.error("[Staff API Update] Validation Error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: error.errors });
      }
      console.error("[Staff API Update] Server Error:", error);
      return res.status(500).json({ error: error.message || "Failed to update staff member" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await StaffService.deleteUser(id);
      return res.status(200).json({ success: true, message: "Staff member deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to delete staff member" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
