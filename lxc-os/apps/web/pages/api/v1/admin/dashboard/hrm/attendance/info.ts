import { NextApiRequest, NextApiResponse } from 'next';
import { AttendanceService } from '@/lib/services/admin/dashboard/AttendanceService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });
    
    const { type, employeeId, year, month } = req.query; 
    // type = today | history | monthly
    
    if (!employeeId || typeof employeeId !== 'string') return res.status(400).json({ error: "Employee ID required" });

    try {
        if (type === 'today') {
            const data = await AttendanceService.getTodayAttendance(employeeId);
            return res.status(200).json({ success: true, data });
        } else if (type === 'monthly') {
             if (!year || !month) return res.status(400).json({ error: "Year and month required" });
             const data = await AttendanceService.getMonthlyAttendance(employeeId, Number(month), Number(year));
             return res.status(200).json({ success: true, data });
        } else if (type === 'history') {
             const data = await AttendanceService.getAttendanceHistory(employeeId);
             return res.status(200).json({ success: true, ...data });
        }
        return res.status(400).json({ error: "Invalid type" });
    } catch (e: any) {
         return res.status(500).json({ error: e.message });
    }
}
