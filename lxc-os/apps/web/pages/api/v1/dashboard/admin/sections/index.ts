
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { createSectionSchema } from "@/lib/validations/admin/educational";

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
    const validatedData = createSectionSchema.parse(req.body);

    // Verify class belongs to the school
    const classExists = await prisma.class.findFirst({
      where: { id: validatedData.classId, schoolId: user.schoolId }
    });

    if (!classExists) {
      return res.status(404).json({ error: "Class not found" });
    }

    const newSection = await prisma.section.create({
      data: {
        name: validatedData.name,
        capacity: validatedData.capacity,
        classId: validatedData.classId
      }
    });

    return res.status(201).json(newSection);
  } catch (error: any) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
    return res.status(500).json({ error: error.message || "Failed to create section" });
  }
}
