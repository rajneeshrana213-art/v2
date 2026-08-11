import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { updateDocumentTemplateSchema } from "@/lib/validations/admin/documents";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { method } = req;
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid template ID" });
  }

  // Ensure template belongs to the school or is common (Super Admin can see all)
  const template = await prisma.documentTemplate.findFirst({
    where:
      user.role === "superadmin"
        ? { id }
        : {
            id,
            OR: [{ schoolId: user.schoolId }, { schoolId: null }],
          },
  });

  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }

  switch (method) {
    case "GET":
      return res.status(200).json(template);

    case "PUT":
      try {
        // Only Super Admin can manage templates
        if (user.role !== "superadmin") {
          return res
            .status(403)
            .json({ error: "Only super admin can manage templates" });
        }

        const validatedData = updateDocumentTemplateSchema.parse(req.body);

        // If this template is being set as default, unset others of same type/category
        if (validatedData.isDefault) {
          await prisma.documentTemplate.updateMany({
            where: {
              schoolId:
                validatedData.schoolId !== undefined
                  ? validatedData.schoolId
                  : template.schoolId,
              type: template.type as any,
              category: template.category as any,
              isDefault: true,
              NOT: { id },
            },
            data: { isDefault: false },
          });
        }

        const updatedTemplate = await prisma.documentTemplate.update({
          where: { id },
          data: {
            ...validatedData,
            type: validatedData.type as any,
            category: validatedData.category as any,
            status: validatedData.status as any,
          },
        });

        return res.status(200).json(updatedTemplate);
      } catch (error: any) {
        if (error.name === "ZodError")
          return res.status(400).json({ error: error.errors });
        return res
          .status(500)
          .json({ error: error.message || "Failed to update template" });
      }

    case "DELETE":
      try {
        // Only Super Admin can manage templates
        if (user.role !== "superadmin") {
          return res
            .status(403)
            .json({ error: "Only super admin can manage templates" });
        }

        // Check if the template is in use by any issued documents
        const inUseCount = await prisma.issuedDocument.count({
          where: { templateId: id },
        });

        if (inUseCount > 0) {
          // Force delete: delete all associated issued documents first
          await prisma.issuedDocument.deleteMany({
            where: { templateId: id },
          });
        }

        await prisma.documentTemplate.delete({
          where: { id },
        });
        return res
          .status(200)
          .json({ message: "Template deleted successfully" });
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: error.message || "Failed to delete template" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
