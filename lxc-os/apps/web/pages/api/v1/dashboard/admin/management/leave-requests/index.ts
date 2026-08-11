
import { NextApiRequest, NextApiResponse } from "next";
import { AdminLeaveRequestService } from "@/lib/services/admin/LeaveRequestService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as fcmTriggers from "@/lib/services/notification/fcm-trigger-service";

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
            if (req.query.type === 'counts') {
                const counts = await AdminLeaveRequestService.getPendingCounts(schoolId);
                return res.status(200).json(counts);
            }

            const type = (req.query.type as 'staff' | 'student') || 'student';
            const requests = await AdminLeaveRequestService.getLeaveRequests(schoolId, type);
            return res.status(200).json(requests);
        }

        if (req.method === "PUT") {
            const { id, status, note } = req.body;
            const updated = await AdminLeaveRequestService.updateLeaveStatus(id, {
                status,
                note,
                approverId: (session.user as any).id
            });

            // 🔔 Notify the requester of the decision (fire-and-forget)
            if ((status === "APPROVED" || status === "REJECTED") && updated?.userId) {
                fcmTriggers.notifyLeaveDecision(updated.userId, status, schoolId);
            }

            return res.status(200).json(updated);
        }

        res.setHeader("Allow", ["GET", "PUT"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error: any) {
        console.error("Leave Request API Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
