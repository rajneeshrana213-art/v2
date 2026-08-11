import { NextApiRequest, NextApiResponse } from "next";

import { runMiddleware } from "@/lib/middleware/run-middleware";
import { cors } from "@/lib/middleware/cors";
import { createStudentEvaluationService } from "@/lib/services/teacher/EnhancementService";
import { updateClassLeaderboard } from "@/lib/services/common/LeaderboardService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "teacher" && user.role !== "superadmin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const evaluation = await createStudentEvaluationService({
          ...req.body,
          teacherId: user.id
        });

        // Trigger leaderboard update
        updateClassLeaderboard(evaluation.classId).catch(console.error);

        return res.status(201).json(evaluation);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
