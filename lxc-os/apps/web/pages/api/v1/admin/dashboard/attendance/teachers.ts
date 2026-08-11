
import { NextApiRequest, NextApiResponse } from "next";
import { AdminAttendanceService } from "@/lib/services/admin/dashboard/AdminAttendanceService";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    try {
        const user = await verifyAuth(req, res);
        if (!user || user.role !== "admin") return res.status(401).json({ error: "Forbidden" });

        const { date, viewRange } = req.query;
        const referenceDate = date ? new Date(date as string) : new Date();
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (viewRange === "weekly") {
            startDate = new Date(referenceDate);
            startDate.setDate(referenceDate.getDate() - referenceDate.getDay());
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        } else if (viewRange === "monthly") {
            startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
            endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
        } else if (viewRange === "all") {
            startDate = new Date(2000, 0, 1);
            endDate = new Date();
        }

        const data = await AdminAttendanceService.getTeacherAttendance(
            user.schoolId!, 
            referenceDate,
            startDate,
            endDate
        );

        return res.status(200).json(data);
    } catch (error: any) {
        console.error("Teacher Attendance Fetch Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
