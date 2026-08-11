
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../../lib/prisma";
import { verifyAuth } from "../../../../../../../lib/auth";
import { cors } from "../../../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;
  const user = (req as any).user;

  const { id } = req.query; // This is the HomeworkSubmission ID

  const teacher = await prisma.teacher.findFirst({
    where: { userId: user.id },
  });

  if (!teacher) {
    return res.status(404).json({ error: "Teacher record not found" });
  }

  if (req.method === "PATCH") {
    try {
      const { score, feedback } = req.body;

      // Authorization check: Ensure teacher teaches the class associated with this submission's homework
      const submission = await prisma.homeworkSubmission.findUnique({
        where: { id: id as string },
        include: {
          homework: true
        }
      });

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      const teachesClass = await prisma.class.findFirst({
        where: {
          id: submission.homework.classId,
          Teacher: { some: { id: teacher.id } }
        }
      });

      if (!teachesClass) {
        return res.status(403).json({ error: "Forbidden: You do not have access to grade this submission" });
      }

      const updated = await prisma.homeworkSubmission.update({
        where: { id: id as string },
        data: {
          score: parseInt(score),
          feedback
        }
      });

      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
