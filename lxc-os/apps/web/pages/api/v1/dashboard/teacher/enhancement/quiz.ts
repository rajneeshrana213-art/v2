import { NextApiRequest, NextApiResponse } from "next";

import { cors } from "@/lib/middleware/cors";
import { createQuizService, getQuizzesByTeacher, deleteQuizService } from "@/lib/services/teacher/EnhancementService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "teacher" && user.role !== "superadmin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { classId } = req.query;
        const quizzes = await getQuizzesByTeacher(classId as string);
        return res.status(200).json(quizzes);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    case "POST":
      try {
        const quiz = await createQuizService(req.body);
        return res.status(201).json(quiz);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    case "DELETE":
      try {
        const { id } = req.query;
        await deleteQuizService(id as string);
        return res.status(200).json({ message: "Quiz deleted" });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
