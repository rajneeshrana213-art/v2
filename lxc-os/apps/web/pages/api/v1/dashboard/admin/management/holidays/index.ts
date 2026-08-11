
import { NextApiRequest, NextApiResponse } from "next";
import { HolidayService } from "@/lib/services/admin/HolidayService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
            const holidays = await HolidayService.getHolidays(schoolId);
            return res.status(200).json(holidays);
        }

        if (req.method === "POST") {
            const holiday = await HolidayService.createHoliday({ ...req.body, schoolId });
            return res.status(201).json(holiday);
        }

        if (req.method === "PUT") {
            const { id, ...data } = req.body;
            const holiday = await HolidayService.updateHoliday(id, data);
            return res.status(200).json(holiday);
        }

        if (req.method === "DELETE") {
            const { id } = req.query;
            await HolidayService.deleteHoliday(id as string);
            return res.status(200).json({ success: true });
        }

        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error: any) {
        console.error("Holiday API Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
