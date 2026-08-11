import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { issueDocumentSchema } from "@/lib/validations/admin/documents";
import { DocumentService } from "@/lib/utils/documents/document-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { method } = req;

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const validatedData = issueDocumentSchema.parse(req.body);
    const targetSchoolId = user.role === "superadmin" ? (validatedData as any).schoolId : user.schoolId;

    if (!targetSchoolId) {
      return res.status(400).json({ error: "School context is required for document generation" });
    }

    const issuedDocument = await DocumentService.generateAndIssue({
      templateId: validatedData.templateId,
      targetUserId: validatedData.targetUserId,
      schoolId: targetSchoolId,
      issuedById: user.id,
      customData: validatedData.data,
    });

    return res.status(201).json(issuedDocument);
  } catch (error: any) {
    console.error("Document Generation Error:", error);
    if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
    return res.status(500).json({ error: error.message || "Failed to generate document" });
  }
}
