import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DocumentTemplateService } from "@/lib/services/superadmin/DocumentTemplateService";
import { createDocumentTemplateSchema } from "@/lib/validations/admin/documents";
import { CreateTemplateInput } from "@/lib/services/superadmin/DocumentTemplateService";

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

    if (req.method === "GET") {
      const {
        schoolId,
        type,
        category,
        status,
        search,
      } = req.query;

      const filters: any = {};
      
      if (schoolId !== undefined) {
        filters.schoolId = schoolId === "null" ? null : schoolId as string;
      }
      
      if (type) filters.type = type as string;
      if (category) filters.category = category as string;
      if (status) filters.status = status as string;
      if (search) filters.search = search as string;

      const templates = await DocumentTemplateService.getTemplates(filters);
      return res.status(200).json(templates);
    }

    if (req.method === "POST") {
      const result = createDocumentTemplateSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.errors,
        });
      }

      const template = await DocumentTemplateService.createTemplate(
        result.data as CreateTemplateInput
      );
      return res.status(201).json(template);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("Error in documents API:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

