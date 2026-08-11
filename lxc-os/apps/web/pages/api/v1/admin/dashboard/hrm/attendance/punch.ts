import { NextApiRequest, NextApiResponse } from 'next';
import { AttendanceService } from '@/lib/services/admin/dashboard/AttendanceService';
import { punchSchema } from '@/lib/validations/admin/hrm';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    const { action } = req.query; // ?action=in or ?action=out
    
    const result = punchSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors });

    try {
        if (action === 'in') {
            const data = await AttendanceService.punchIn(result.data);
            return res.status(200).json({ success: true, message: "Punched in", data });
        } else if (action === 'out') {
             const data = await AttendanceService.punchOut(result.data);
             return res.status(200).json({ success: true, message: "Punched out", data });
        }
        return res.status(400).json({ error: "Invalid action. Use ?action=in or ?action=out" });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
}
