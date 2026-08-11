
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { updateSectionSchema } from "@/lib/validations/admin/educational";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid section ID" });
  }

  const { method } = req;

  // First verify section belongs to a class in the user's school
  const section = await prisma.section.findFirst({
    where: { id, class: { schoolId: user.schoolId } }
  });

  if (!section) {
    return res.status(404).json({ error: "Section not found" });
  }

  switch (method) {
    case "PUT":
      try {
        const validatedData = updateSectionSchema.parse(req.body);
        const updatedSection = await prisma.section.update({
          where: { id },
          data: { 
            name: validatedData.name,
            capacity: validatedData.capacity 
          }
        });
        return res.status(200).json(updatedSection);
      } catch (error: any) {
        if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
        return res.status(500).json({ error: error.message || "Failed to update section" });
      }

    case "DELETE":
      try {
        await prisma.section.delete({ where: { id } });
        return res.status(204).end();
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to delete section" });
      }

    default:
      res.setHeader("Allow", ["PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
