
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid class ID" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const [teachers, classWithTeachers] = await Promise.all([
          prisma.teacher.findMany({
            where: { schoolId: user.schoolId },
            include: { user: { select: { name: true, profilePic: true, email: true } } }
          }),
          prisma.class.findUnique({
            where: { id, schoolId: user.schoolId },
            include: { Teacher: { select: { id: true } } }
          })
        ]);

        if (!classWithTeachers) {
          return res.status(404).json({ error: "Class not found" });
        }

        const assignedTeacherIds = classWithTeachers.Teacher.map(t => t.id);

        return res.status(200).json({
          success: true,
          data: {
            allTeachers: teachers,
            assignedTeacherIds
          }
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to fetch teachers for class" });
      }

    case "POST":
      try {
        const { teacherIds } = req.body;
        
        if (!Array.isArray(teacherIds)) {
          return res.status(400).json({ error: "teacherIds must be an array" });
        }

        // Verify all teachers belong to the school
        const validTeachersCount = await prisma.teacher.count({
          where: {
            id: { in: teacherIds },
            schoolId: user.schoolId
          }
        });

        if (validTeachersCount !== teacherIds.length) {
          return res.status(400).json({ error: "One or more teacher IDs are invalid for this school" });
        }

        await prisma.class.update({
          where: { id, schoolId: user.schoolId },
          data: {
            Teacher: {
              set: teacherIds.map(id => ({ id }))
            }
          }
        });

        return res.status(200).json({
          success: true,
          message: "Teachers assigned successfully"
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to update teacher assignments" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
