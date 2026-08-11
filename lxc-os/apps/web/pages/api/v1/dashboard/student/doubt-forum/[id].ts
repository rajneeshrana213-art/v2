import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { getDoubtByIdService, updateDoubtStatusService, voteDoubtReplyService, acceptDoubtReplyService } from "@/lib/services/common/DoubtService";
import { DoubtStatus } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res);
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== "student") {
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
                if (action === "accept-reply") {
                    if (!replyId) {
                        return res.status(400).json({ error: "Reply ID required" });
                    }
                    const result = await acceptDoubtReplyService(replyId, id as string, user.id);
                    return res.status(200).json(result);
                } else if (action === "vote-reply") {
                    if (!replyId || direction === undefined) {
                        return res.status(400).json({ error: "Reply ID and direction required" });
                    }
                    const result = await voteDoubtReplyService(replyId, direction);
                    return res.status(200).json(result);
                } else if (status) {
                    if (status !== DoubtStatus.CLOSED) {
                        return res.status(400).json({ error: "Students can only mark doubts as CLOSED" });
                    }
                    const result = await updateDoubtStatusService(id as string, status as DoubtStatus);
                    return res.status(200).json(result);
                } else {
                    return res.status(400).json({ error: "Invalid action" });
                }
            } catch (error: any) {
                if (error.message === "Only the doubt owner can accept an answer") {
                    return res.status(403).json({ error: error.message });
                }
                return res.status(500).json({ error: error.message });
            }

        default:
            res.setHeader("Allow", ["GET", "PATCH"]);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
