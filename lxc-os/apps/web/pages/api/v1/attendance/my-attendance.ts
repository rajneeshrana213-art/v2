
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { formatISTDateKey, getInstitutionalMonthRange, getISTNowParts } from "@/lib/utils/date-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res);
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    try {
        const user = await verifyAuth(req, res);
        if (!user) return;

        // Month/year should be derived in IST to match calendar expectations.
        const nowParts = getISTNowParts();
        const month = parseInt(req.query.month as string) || nowParts.month;
        const year = parseInt(req.query.year as string) || nowParts.year;

        const teacher = await prisma.teacher.findFirst({ where: { userId: user.id } });
        if (!teacher) return res.status(404).json({ error: "Teacher not found" });

        const { start: startDate, end: endDate } = getInstitutionalMonthRange(year, month);

        const records = await prisma.teacherAttendance.findMany({
            where: {
                teacherId: teacher.id,
                attendanceDate: { gte: startDate, lte: endDate },
            },
            orderBy: { attendanceDate: "asc" },
        });

        // Deduplicate by calendar date — keep only the latest record per day
        const recordsByDate = new Map<string, typeof records[0]>();
        for (const r of records) {
            const dateKey = formatISTDateKey(new Date(r.attendanceDate));
            const existing = recordsByDate.get(dateKey);
            if (!existing || r.createdAt > existing.createdAt) {
                recordsByDate.set(dateKey, r);
            }
        }
        const deduped = Array.from(recordsByDate.values());

        const totalDays = deduped.length;
        const presentDays = deduped.filter(r => r.status === "PRESENT").length;
        const absentDays = deduped.filter(r => r.status === "ABSENT").length;
        const halfDays = deduped.filter(r => r.type === "HALF_DAY").length;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        const calendar = deduped.map(r => ({
            date: r.attendanceDate,
            status: r.status,
            type: r.type,
            matched: r.matched,
            selfieImageUrl: r.selfieImageUrl,
            latitude: r.latitude,
            longitude: r.longitude,
            verificationLatencyMs: (r as any).verificationLatencyMs ?? null,
        }));

        return res.status(200).json({
            month,
            year,
            calendar,
            summary: {
                totalDays,
                presentDays,
                absentDays,
                halfDays,
                attendancePercentage,
            },
        });
    } catch (error: any) {
        console.error("My attendance error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
