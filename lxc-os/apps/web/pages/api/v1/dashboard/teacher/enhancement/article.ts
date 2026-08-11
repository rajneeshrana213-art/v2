import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { createArticleService, getArticlesService, deleteArticleService, getArticleSubmissionsService, evaluateArticleSubmissionService } from "@/lib/services/teacher/EnhancementService";
import { updateEnhancementLeaderboard } from "@/lib/services/common/LeaderboardService";

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
        const { id, classId, type } = req.query;
        if (type === "submissions") {
          const submissions = await getArticleSubmissionsService(id as string);
          return res.status(200).json(submissions);
        }
        const articles = await getArticlesService(classId as string);
        return res.status(200).json(articles);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    case "POST":
      try {
        const { type } = req.query;
        if (type === "evaluate") {
          const { submissionId, score, feedback } = req.body;
          const updated = await evaluateArticleSubmissionService(submissionId, score, feedback);

          // Trigger leaderboard update in background
          if (updated.student.schoolId) {
            updateEnhancementLeaderboard(updated.student.schoolId).catch(console.error);
          }

          return res.status(200).json(updated);
        }
        const article = await createArticleService({ ...req.body, userId: user.id });
        return res.status(201).json(article);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    case "DELETE":
      try {
        const { id } = req.query;
        await deleteArticleService(id as string);
        return res.status(200).json({ message: "Article deleted" });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
