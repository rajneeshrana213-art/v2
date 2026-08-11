
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../lib/prisma";
import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "../../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;
  const user = (req as any).user;

  const { id } = req.query;

  const teacher = await prisma.teacher.findFirst({
    where: { userId: user.id },
  });

  if (!teacher) {
    return res.status(404).json({ error: "Teacher record not found" });
  }

  if (req.method === "GET") {
    try {
      const homework = await prisma.homeWork.findUnique({
        where: { id: id as string },
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true } },
          HomeworkSubmission: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      name: true,
                      profilePic: true,
                    }
                  }
                }
              }
            },
            orderBy: { submittedAt: "desc" }
          }
        },
      });

      if (!homework) {
        return res.status(404).json({ error: "Homework not found" });
      }

      // Authorization check: Ensure teacher teaches this class
      const teachesClass = await prisma.class.findFirst({
        where: {
          id: homework.classId,
          Teacher: { some: { id: teacher.id } }
        }
      });

      if (!teachesClass) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this class's homework" });
      }

      return res.status(200).json(homework);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { status } = req.body;
      const updated = await prisma.homeWork.update({
        where: { id: id as string },
        data: { status }
      });
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
