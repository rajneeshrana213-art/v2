import { NextApiRequest, NextApiResponse } from 'next';
import { AttendanceService } from '@/lib/services/admin/dashboard/AttendanceService';
import { prisma } from "@/lib/prisma";

// Public endpoint: intentionally accessible without session authentication.
// Today's attendance record is fetched via employeeCode so that kiosk or
// mobile clients can display status without a user login session.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });
    
    const { employeeCode } = req.query;
    if (!employeeCode || typeof employeeCode !== 'string') return res.status(400).json({ error: "Employee Code required" });

    try {
        const employee = await prisma.employee.findUnique({ where: { employeeCode } });
        if (!employee) return res.status(404).json({ error: "Employee not found" });

        const data = await AttendanceService.getTodayAttendance(employee.id);
        return res.status(200).json({ success: true, data });
    } catch (e: any) {
         return res.status(500).json({ error: e.message });
    }
}
