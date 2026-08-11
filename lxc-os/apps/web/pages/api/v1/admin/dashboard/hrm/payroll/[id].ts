import { NextApiRequest, NextApiResponse } from 'next';
import { PayrollService } from '@/lib/services/admin/dashboard/PayrollService';
import { updatePayrollSchema } from '@/lib/validations/admin/hrm';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    if (req.method === 'GET') {
        const item = await PayrollService.getPayrollById(id);
        if (!item) return res.status(404).json({ error: "Payroll not found" });
        return res.status(200).json(item);
    } else if (req.method === 'DELETE') {
        await PayrollService.deletePayroll(id);
        return res.status(204).end();
    } else if (req.method === 'PUT') {
        const result = updatePayrollSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        try {
            const updated = await PayrollService.updatePayroll(id, result.data);
            return res.status(200).json(updated);
        } catch (e: any) {
             return res.status(500).json({ error: e.message });
        }
    }
    return res.status(405).json({ error: "Method not allowed" });
}
