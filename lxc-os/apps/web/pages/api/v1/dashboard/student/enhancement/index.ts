import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "student") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { type } = req.query;
        const now = new Date();
        if (type === "quiz") {
          const quizzes = await prisma.quiz.findMany({
            where: {
              classId: student.classId ?? undefined,
              startDate: { lte: now },
              endDate: { gte: now }
            },
            include: { subject: true, quizResults: { where: { userId: user.id } } }
          });
          return res.status(200).json(quizzes);
        }
        if (type === "article") {
          const articles = await prisma.newspaper.findMany({
            where: {
              classId: student.classId ?? undefined,
              createdAt: { lte: now }
            },
            include: { subject: true, NewspaperSubmission: { where: { studentId: user.id } } }
          });
          return res.status(200).json(articles);
        }
        return res.status(400).json({ error: "Invalid type" });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
