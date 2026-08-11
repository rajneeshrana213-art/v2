
import { NextApiRequest, NextApiResponse } from "next";
import { AdminAttendanceService } from "@/lib/services/admin/dashboard/AdminAttendanceService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const user = await verifyAuth(req, res);
        if (!user || user.role !== "admin") return res.status(401).json({ error: "Forbidden" });

        if (req.method === "GET") {
            const data = await AdminAttendanceService.getTeacherFaceStatus(user.schoolId!);
            return res.status(200).json(data);
        }

        if (req.method === "POST") {
            const { teacherId, faceImage, embedding, latitude, longitude } = req.body;
            if (!teacherId || !faceImage || !embedding) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const data = await AdminAttendanceService.updateFaceModel(
                teacherId, faceImage, embedding,
                latitude != null ? Number(latitude) : undefined,
                longitude != null ? Number(longitude) : undefined
            );
            return res.status(200).json({ success: true, data });
        }

        if (req.method === "DELETE") {
            const { teacherId } = req.query;
            if (!teacherId || typeof teacherId !== 'string') return res.status(400).json({ error: "Missing teacherId" });
            const data = await AdminAttendanceService.deleteFaceModel(teacherId);
            return res.status(200).json({ success: true, data });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error: any) {
        console.error("Face Model management Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
