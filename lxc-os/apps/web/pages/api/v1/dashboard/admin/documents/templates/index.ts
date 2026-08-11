import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { createDocumentTemplateSchema } from "@/lib/validations/admin/documents";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { type, category, schoolId: querySchoolId } = req.query;
        const targetSchoolId = user.role === "superadmin" ? (querySchoolId as string) : user.schoolId;

        // Fetch templates
        // Super Admin sees everything by default, but can filter by schoolId. 
        // Admin sees school-specific + common.
        const templates = await prisma.documentTemplate.findMany({
          where: {
            ...(user.role !== "superadmin" ? {
              OR: [
                { schoolId: targetSchoolId },
                { schoolId: null }
              ],
            } : (targetSchoolId ? {
              OR: [
                { schoolId: targetSchoolId },
                { schoolId: null }
              ]
            } : {})),
            ...(type && { type: type as any }),
            ...(category && { category: category as any }),
          },
          include: {
            school: {
              select: {
                schoolName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(templates);
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to fetch templates" });
      }

    case "POST":
      try {
        // Only Super Admin can create/manage templates
        if (user.role !== "superadmin") {
          return res.status(403).json({ error: "Only super admin can create templates" });
        }

        const validatedData = createDocumentTemplateSchema.parse(req.body);

        // If this template is set as default, unset others of same type/category for the target school/common
        if (validatedData.isDefault) {
          await prisma.documentTemplate.updateMany({
            where: {
              schoolId: validatedData.schoolId || null,
              type: validatedData.type as any,
              category: validatedData.category as any,
              isDefault: true,
            },
            data: { isDefault: false },
          });
        }

        const newTemplate = await prisma.documentTemplate.create({
          data: {
            name: validatedData.name,
            type: validatedData.type as any,
            category: validatedData.category as any,
            content: validatedData.content,
            description: validatedData.description,
            isDefault: validatedData.isDefault,
            status: validatedData.status as any,
            schoolId: validatedData.schoolId || null, // Can be null for common templates
          },
        });

        return res.status(201).json(newTemplate);
      } catch (error: any) {
        if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
        return res.status(500).json({ error: error.message || "Failed to create template" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
