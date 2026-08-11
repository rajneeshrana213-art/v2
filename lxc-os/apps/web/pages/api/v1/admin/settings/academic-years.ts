import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getAcademicYearsBySchoolId, createAcademicYear, updateAcademicYear } from "@/lib/services/school-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
    }

    const schoolId = user.schoolId;
    if (!schoolId) return res.status(400).json({ error: "No school associated" });

    const { id } = req.query;

    if (req.method === "GET") {
        try {
            const years = await getAcademicYearsBySchoolId(schoolId);
            return res.status(200).json(years);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === "POST") {
        try {
            const { year, startDate, endDate, isActive } = req.body;
            const result = await createAcademicYear(schoolId, { 
                year, 
                startDate: new Date(startDate), 
                endDate: new Date(endDate), 
                isActive 
            });
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === "PATCH") {
        try {
            if (!id) return res.status(400).json({ error: "ID required" });
            const { year, startDate, endDate, isActive } = req.body;
            const result = await updateAcademicYear(id as string, schoolId, {
                year,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isActive
            });
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
