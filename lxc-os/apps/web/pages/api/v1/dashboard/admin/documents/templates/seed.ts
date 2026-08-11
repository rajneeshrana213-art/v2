import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { PREDEFINED_TEMPLATES } from "@/lib/constants/document-templates";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  // For security, only allow POST and verify auth
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;

  if (user.role !== 'superadmin') {
    return res.status(403).json({ error: "Only super admin can seed common templates" });
  }

  try {
    const results = [];
    for (const template of PREDEFINED_TEMPLATES) {
      const existing = await prisma.documentTemplate.findFirst({
        where: {
          schoolId: null, // Check for common templates
          name: template.name,
        },
      });

      if (existing) {
        results.push({ name: template.name, status: "Skipped (Exists as Common)" });
        continue;
      }

      await prisma.documentTemplate.create({
        data: {
          name: template.name,
          type: template.type as any,
          category: template.category as any,
          description: template.description,
          content: template.content,
          schoolId: null, // Seed as common template
          status: "PUBLISHED",
          isDefault: false,
        },
      });
      results.push({ name: template.name, status: "Created (Common)" });
    }

    return res.status(200).json({ success: true, results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Seeding failed" });
  }
}
