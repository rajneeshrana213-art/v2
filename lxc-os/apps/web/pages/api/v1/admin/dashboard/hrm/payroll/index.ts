import { NextApiRequest, NextApiResponse } from 'next';
import { PayrollService } from '@/lib/services/admin/dashboard/PayrollService';
import { createPayrollSchema } from '@/lib/validations/admin/hrm';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
        const { schoolId } = req.query;
        if (!schoolId) return res.status(400).json({ error: "School ID required" });
        try {
            const list = await PayrollService.getPayrolls(schoolId as string);
            return res.status(200).json(list);
        } catch (e: any) {
             return res.status(500).json({ error: e.message });
        }
    } else if (req.method === 'POST') {
        const result = createPayrollSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        try {
            const created = await PayrollService.createPayroll(result.data);
            return res.status(201).json(created);
        } catch (e: any) {
             return res.status(500).json({ error: e.message });
        }
    }
    return res.status(405).json({ error: "Method not allowed" });
}
