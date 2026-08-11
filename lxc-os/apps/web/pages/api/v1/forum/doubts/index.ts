import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import {
  getPublicDoubtsService,
  createDoubtReplyService,
} from "@/lib/services/common/DoubtService";
import { DoubtStatus, Role } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const { method } = req;

  if (method === "GET") {
    // Public: no auth required to browse doubts
    try {
      const { subjectId, status, search, page, limit } = req.query;
      const result = await getPublicDoubtsService({
        subjectId: subjectId as string,
        status: status as DoubtStatus | "ACTIVE",
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === "POST") {
    // Auth required to post an answer
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (
      user.role !== "forum_user" &&
      user.role !== "teacher" &&
      user.role !== "student" &&
      user.role !== "admin" &&
      user.role !== "superadmin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { doubtId, content, attachmentUrl } = req.body;
      if (!doubtId || !content) {
        return res
          .status(400)
          .json({ error: "doubtId and content are required" });
      }

      const reply = await createDoubtReplyService({
        doubtId,
        userId: user.id,
        role: user.role as Role,
        content,
        attachmentUrl,
      });
      return res.status(201).json(reply);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
