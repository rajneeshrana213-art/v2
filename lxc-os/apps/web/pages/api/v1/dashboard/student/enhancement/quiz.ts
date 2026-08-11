import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { updateEnhancementLeaderboard } from "@/lib/services/common/LeaderboardService";

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
        const { id } = req.query;
        const quiz = await prisma.quiz.findUnique({
          where: { id: id as string },
          include: { questions: true }
        });
        return res.status(200).json(quiz);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    case "POST":
      try {
        const { quizId, answers } = req.body; // answers: { [questionId: string]: string }

        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          include: { questions: true }
        });

        if (!quiz) return res.status(404).json({ error: "Quiz not found" });

        // Grading
        let correctCount = 0;
        quiz.questions.forEach((q) => {
          if (answers[q.id] === q.correctAnswer) {
            correctCount++;
          }
        });

        const score = Math.round((correctCount / quiz.questions.length) * quiz.points);

        const result = await prisma.quizResult.create({
          data: {
            quizId,
            userId: user.id,
            score
          }
        });

        // Trigger leaderboard update
        updateEnhancementLeaderboard(student.schoolId).catch(console.error);

        return res.status(201).json(result);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
