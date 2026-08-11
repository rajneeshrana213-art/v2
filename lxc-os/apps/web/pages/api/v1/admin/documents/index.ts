import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DocumentTemplateService } from "@/lib/services/superadmin/DocumentTemplateService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== Role.admin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const {
      type,
      category,
      status,
      search,
    } = req.query;

    // Admin can only see:
    // 1. Common templates (schoolId = null)
    // 2. Templates assigned to their school (schoolId = user.schoolId)
    
    const filters: any = {};
    
    if (type) filters.type = type as string;
    if (category) filters.category = category as string;
    if (status) filters.status = status as string;
    if (search) filters.search = search as string;

    // Get common templates (schoolId = null)
    const commonTemplates = await DocumentTemplateService.getTemplates({
      ...filters,
      schoolId: null,
    });

    // Get school-specific templates if user has a schoolId
    let schoolTemplates: any[] = [];
    if (user.schoolId) {
      schoolTemplates = await DocumentTemplateService.getTemplates({
        ...filters,
        schoolId: user.schoolId,
      });
    }

    // Combine and remove duplicates (in case of any overlap)
    const allTemplates = [...commonTemplates, ...schoolTemplates];
    const uniqueTemplates = allTemplates.filter(
      (template, index, self) =>
        index === self.findIndex((t) => t.id === template.id)
    );

    return res.status(200).json(uniqueTemplates);
  } catch (error: any) {
    console.error("Error in admin documents API:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

