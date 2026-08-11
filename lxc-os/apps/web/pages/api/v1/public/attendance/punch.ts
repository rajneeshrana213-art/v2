import { NextApiRequest, NextApiResponse } from 'next';
import { AttendanceService } from '@/lib/services/admin/dashboard/AttendanceService';
import { punchSchema } from '@/lib/validations/admin/hrm';

// Public endpoint: intentionally accessible without session authentication.
// Attendance punch-in/out is submitted via kiosk or mobile by employees
// identified by their employeeCode, not by a login session.
// Rate-limiting should be applied at the infrastructure level.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    const { action } = req.query; 
    
    const result = punchSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors });

    try {
        // Enforce employeeCode only for public API if strictness needed, but service handles both
        if (action === 'in') {
            const data = await AttendanceService.punchIn(result.data);
            return res.status(200).json({ success: true, message: "Punched in", data });
        } else if (action === 'out') {
             const data = await AttendanceService.punchOut(result.data);
             return res.status(200).json({ success: true, message: "Punched out", data });
        }
        return res.status(400).json({ error: "Invalid action" });
    } catch (e: any) {
         return res.status(500).json({ error: e.message });
    }
}
