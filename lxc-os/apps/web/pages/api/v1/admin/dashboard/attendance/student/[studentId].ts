import { NextApiRequest, NextApiResponse } from "next";
import { AdminAttendanceService } from "@/lib/services/admin/dashboard/AdminAttendanceService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    try {
        const user = await verifyAuth(req, res);
        if (!user || user.role !== "admin") return res.status(401).json({ error: "Forbidden" });

        const { studentId, month, year } = req.query;
        
        if (!studentId || typeof studentId !== "string") {
            return res.status(400).json({ error: "studentId is required" });
        }

        const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
        const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

        const data = await AdminAttendanceService.getStudentDetailedAttendance(
            user.schoolId!,
            studentId,
            targetMonth,
            targetYear
        );

        return res.status(200).json(data);
    } catch (error: any) {
        console.error("Student Detailed Attendance Fetch Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
