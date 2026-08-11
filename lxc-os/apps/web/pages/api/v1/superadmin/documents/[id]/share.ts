import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DocumentTemplateService } from "@/lib/services/superadmin/DocumentTemplateService";
import { z } from "zod";

const shareTemplateSchema = z.object({
  schoolIds: z.array(z.string()).min(1, "At least one school must be selected"),
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

    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Template ID is required" });
    }

    const result = shareTemplateSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.errors,
      });
    }

    const templates = await DocumentTemplateService.shareTemplateWithSchools(
      id,
      result.data.schoolIds
    );

    return res.status(200).json({
      success: true,
      message: `Template shared with ${templates.length} school(s)`,
      templates,
    });
  } catch (error: any) {
    console.error("Error in share template API:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

