
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../lib/prisma";
import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "../../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;
  const user = (req as any).user;

  const teacher = await prisma.teacher.findFirst({
    where: { userId: user.id },
    include: { classes: true, subjects: true }
  });

  if (!teacher) {
    return res.status(404).json({ error: "Teacher record not found" });
  }

  if (req.method === "GET") {
    try {
      const homeworks = await prisma.homeWork.findMany({
        where: {
          class: {
            Teacher: { some: { id: teacher.id } }
          }
        },
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true } },
          _count: { select: { HomeworkSubmission: true } }
        },
        orderBy: { createdAt: "desc" }
      });
      return res.status(200).json(homeworks);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { title, description, dueDate, classId, subjectId, attachment } = req.body;

      if (!title || !classId || !subjectId || !dueDate) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const homework = await prisma.homeWork.create({
        data: {
          title,
          description,
          dueDate: new Date(dueDate),
          classId,
          subjectId,
          attachment,
          status: "PENDING"
        }
      });

      return res.status(201).json(homework);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
