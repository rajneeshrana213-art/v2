import { NextApiRequest, NextApiResponse } from 'next';
import { EmployeeService } from '@/lib/services/admin/dashboard/EmployeeService';
import { updateEmployeeSchema } from '@/lib/validations/admin/hrm';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    if (req.method === 'GET') {
        const item = await EmployeeService.getEmployeeById(id);
        if (!item) return res.status(404).json({ error: "Employee not found" });
        return res.status(200).json({ message: "Employee", data: item });
    } else if (req.method === 'DELETE') {
        await EmployeeService.deleteEmployee(id);
        return res.status(200).json({ message: "Employee deleted" });
    } else if (req.method === 'PUT') {
        // Update handling
         const result = updateEmployeeSchema.safeParse(req.body);
         if (!result.success) return res.status(400).json({ error: result.error.errors });
         try {
            const updated = await EmployeeService.updateEmployee(id, result.data);
            return res.status(200).json({ message: "Updated", data: updated });
         } catch (e: any) {
             return res.status(500).json({ error: e.message });
         }
    }
    return res.status(405).json({ error: "Method not allowed" });
}
