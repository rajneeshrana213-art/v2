
import { NextApiRequest, NextApiResponse } from "next";
import { CommunicationService } from "@/lib/services/admin/dashboard/CommunicationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import multer from "@/lib/middleware/multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { uploadFile } from "@/lib/config/upload";
import * as fcmTriggers from "@/lib/services/notification/fcm-trigger-service";

export const config = {
    api: {
        bodyParser: false,
    },
};

interface NextApiRequestWithFile extends NextApiRequest {
    file?: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const schoolId = (session.user as any).schoolId;
    if (!schoolId) {
        return res.status(400).json({ error: "School ID not found in session" });
    }

    try {
        if (req.method === "GET") {
            const notices = await CommunicationService.getNotices(schoolId);
            return res.status(200).json(notices);
        }

        if (req.method === "POST") {
            await runMiddleware(req, res, multer.single("attachment"));
            
            let attachmentUrl = req.body.attachment;

            if ((req as any).file) {
                const file = (req as any).file;
                const fileType = file.mimetype.startsWith("image/") ? "image" : "raw";
                const uploadResult = await uploadFile(file.buffer, "notices", fileType, file.originalname);
                attachmentUrl = uploadResult.url;
            }

            const noticeData = {
                ...req.body,
                attachment: attachmentUrl,
                schoolId,
                createdById: (session.user as any).id
            };
            const notice = await CommunicationService.createNotice(noticeData);

            // 🔔 Push notification to target role (fire-and-forget)
            const targetRole = req.body.targetAudience || req.body.targetRole || "all";
            fcmTriggers.notifyNoticePublished(schoolId, notice.title, targetRole);

            return res.status(201).json(notice);
        }

        if (req.method === "PUT") {
            await runMiddleware(req, res, multer.single("attachment"));
            
            const { id, ...data } = req.body;
            let attachmentUrl = data.attachment;

            if ((req as any).file) {
                const file = (req as any).file;
                const fileType = file.mimetype.startsWith("image/") ? "image" : "raw";
                const uploadResult = await uploadFile(file.buffer, "notices", fileType, file.originalname);
                attachmentUrl = uploadResult.url;
            }

            const notice = await CommunicationService.updateNotice(id, {
                ...data,
                attachment: attachmentUrl
            });
            return res.status(200).json(notice);
        }

        if (req.method === "DELETE") {
            const { id } = req.query;
            await CommunicationService.deleteNotice(id as string);
            return res.status(200).json({ success: true });
        }

        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error: any) {
        console.error("Notice API Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
