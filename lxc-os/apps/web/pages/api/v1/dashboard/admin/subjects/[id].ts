
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { updateSubjectSchema } from "@/lib/validations/admin/educational";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const validatedData = updateSubjectSchema.parse(req.body);

      // Verify subject belongs to user's school
      const subject = await prisma.subject.findUnique({
        where: { id: id as string },
      });

      if (!subject || subject.schoolId !== user.schoolId) {
        return res.status(404).json({ error: "Subject not found" });
      }

      const updatedSubject = await prisma.subject.update({
        where: { id: id as string },
        data: validatedData,
        include: {
            class: {
                select: { name: true }
            }
        }
      });

      return res.status(200).json(updatedSubject);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      console.error("Update Subject Error:", error);
      return res.status(500).json({ error: "Failed to update subject" });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Verify subject belongs to user's school
      const subject = await prisma.subject.findUnique({
        where: { id: id as string },
      });

      if (!subject || subject.schoolId !== user.schoolId) {
        return res.status(404).json({ error: "Subject not found" });
      }

      await prisma.subject.delete({
        where: { id: id as string },
      });

      return res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error: any) {
      console.error("Delete Subject Error:", error);
      return res.status(500).json({ error: "Failed to delete subject" });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
