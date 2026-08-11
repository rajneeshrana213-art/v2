import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { cors } from "@/lib/middleware/cors";
import { getDoubtByIdService, updateDoubtStatusService, toggleDoubtPinService, toggleDoubtLockService, deleteDoubtReplyService, voteDoubtReplyService } from "@/lib/services/common/DoubtService";
import { DoubtStatus } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "teacher" && user.role !== "admin" && user.role !== "superadmin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { id } = req.query;
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const doubt = await getDoubtByIdService(id as string);
        if (!doubt) return res.status(404).json({ error: "Doubt not found" });
        return res.status(200).json(doubt);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    case "PATCH":
      try {
        const { action, status, replyId, direction } = req.body;
        let result;
        if (action === "pin") {
          result = await toggleDoubtPinService(id as string);
        } else if (action === "lock") {
          result = await toggleDoubtLockService(id as string);
        } else if (action === "vote-reply") {
          if (!replyId || direction === undefined) {
            return res.status(400).json({ error: "Reply ID and direction required" });
          }
          result = await voteDoubtReplyService(replyId, direction);
        } else if (status) {
          result = await updateDoubtStatusService(id as string, status as DoubtStatus);
        } else {
          return res.status(400).json({ error: "Invalid action" });
        }
        return res.status(200).json(result);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    case "DELETE":
      try {
        // Moderation: Delete a specific reply
        const { replyId } = req.body;
        if (replyId) {
          await deleteDoubtReplyService(replyId);
          return res.status(200).json({ message: "Reply deleted" });
        }
        return res.status(400).json({ error: "Reply ID required" });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
