import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DocumentTemplateService } from "@/lib/services/superadmin/DocumentTemplateService";
import { z } from "zod";

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["ID_CARD", "CERTIFICATE", "REPORT_CARD"]).optional(),
  category: z.enum([
    "STUDENT_ID",
    "TEACHER_ID",
    "BONAFIDE",
    "NOC",
    "TRANSFER",
    "CHARACTER",
    "EXPERIENCE",
    "SALARY",
    "ADMISSION",
    "HOSTEL",
  ]).optional(),
  content: z.any().optional(),
  isDefault: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  schoolId: z.string().nullable().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== Role.superadmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Template ID is required" });
    }

    if (req.method === "GET") {
      const template = await DocumentTemplateService.getTemplateById(id);
      return res.status(200).json(template);
    }

    if (req.method === "PATCH") {
      const result = updateTemplateSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.errors,
        });
      }

      const template = await DocumentTemplateService.updateTemplate(
        id,
        result.data
      );
      return res.status(200).json(template);
    }

    if (req.method === "DELETE") {
      await DocumentTemplateService.deleteTemplate(id);
      return res.status(200).json({ success: true, message: "Template deleted successfully" });
    }

    res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("Error in document template API:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

