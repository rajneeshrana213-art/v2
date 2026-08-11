import { NextApiRequest, NextApiResponse } from "next";
import { getTeacherAttendanceStatus } from "@/lib/services/attendance-service";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res);
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    try {
        const user = await verifyAuth(req, res);
        if (!user) return;

        const status = await getTeacherAttendanceStatus(user.id);
        if (!status) return res.status(404).json({ error: "Teacher not found" });

        return res.status(200).json(status);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
