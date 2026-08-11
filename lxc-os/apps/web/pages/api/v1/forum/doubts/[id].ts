import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import {
  getDoubtByIdService,
  acceptDoubtReplyService,
  voteDoubtReplyService,
} from "@/lib/services/common/DoubtService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const { id } = req.query;
  const { method } = req;

  if (method === "GET") {
    // Public: no auth required to view a doubt
    try {
      const doubt = await getDoubtByIdService(id as string);
      if (!doubt) return res.status(404).json({ error: "Doubt not found" });
      return res.status(200).json(doubt);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === "PATCH") {
    const user = await verifyAuth(req, res);
    if (!user) return;

    try {
      const { action, replyId, direction } = req.body;

      if (action === "accept-reply") {
        if (!replyId) {
          return res.status(400).json({ error: "replyId is required" });
        }
        const result = await acceptDoubtReplyService(
          replyId,
          id as string,
          user.id,
        );
        return res.status(200).json(result);
      }

      if (action === "vote-reply") {
        if (!replyId || direction === undefined) {
          return res
            .status(400)
            .json({ error: "replyId and direction are required" });
        }
        const result = await voteDoubtReplyService(replyId, direction);
        return res.status(200).json(result);
      }

      return res.status(400).json({ error: "Invalid action" });
    } catch (error: any) {
      if (error.message === "Only the doubt owner can accept an answer") {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
