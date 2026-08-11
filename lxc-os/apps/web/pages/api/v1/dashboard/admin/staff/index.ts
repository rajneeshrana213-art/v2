
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { StaffService } from "@/lib/services/admin/core/StaffService";
import { registerAccountSchema, registerDriverSchema, registerAcademicsSchema, registerStaffSchema } from "@/lib/validations/admin/staff";

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

  const user = (req as any).user;
  if (!user.schoolId && user.role !== "superadmin") {
    console.warn(`[Staff API Index] User ${user.id} (${user.role}) has no schoolId`);
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  if (req.method === "GET") {
    try {
      const { page = "1", limit = "20" } = req.query;
      const parsedPage = Math.max(1, parseInt(page as string) || 1);
      const parsedLimit = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
      const result = await StaffService.getAllStaff(user.schoolId, parsedPage, parsedLimit);
      return res.status(200).json({ success: true, data: result.staff, pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages } });
    } catch (error: any) {
      console.error("Fetch Staff Error:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch staff" });
    }
  }

  if (req.method === "POST") {
    try {
      const { role, profilePic, ...data } = req.body;
      let result;

      switch (role) {
        case "account":
          registerAccountSchema.parse({ ...data, role, schoolId: user.schoolId });
          result = await StaffService.createAccountant({ ...data, role, schoolId: user.schoolId }, profilePic);
          break;
        case "transport":
          // Reuse account schema since it's common fields
          registerAccountSchema.parse({ ...data, role, schoolId: user.schoolId });
          result = await StaffService.createTransport({ ...data, role, schoolId: user.schoolId }, profilePic);
          break;
        case "hostel":
          // Hostel has specific fields, but StaffService handles parsing capacity
          result = await StaffService.createHostel({ ...data, role, schoolId: user.schoolId }, profilePic);
          break;
        case "library":
          registerAccountSchema.parse({ ...data, role, schoolId: user.schoolId });
          result = await StaffService.createLibrarian({ ...data, role, schoolId: user.schoolId }, profilePic);
          break;
        case "driver":
          registerDriverSchema.parse({ ...data, role, schoolId: user.schoolId });
          result = await StaffService.createDriver({ ...data, role, schoolId: user.schoolId }, profilePic);
          break;
        case "academics":
          registerAcademicsSchema.parse({ ...data, role, schoolId: user.schoolId });
          result = await StaffService.createAcademicsStaff({ ...data, role, schoolId: user.schoolId }, profilePic);
          break;
        case "staff":
          registerStaffSchema.parse({ ...data, role, schoolId: user.schoolId });
          result = await StaffService.createGenericStaff({ ...data, role, schoolId: user.schoolId }, profilePic);
          break;
        default:
          return res.status(400).json({ error: "Invalid role specified" });
      }

      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      console.error("Create Staff Error:", error);
      return res.status(500).json({ error: error.message || "Failed to create staff" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
