import { NextApiRequest, NextApiResponse } from 'next';
import { StaffService } from '@/lib/services/admin/core/StaffService';
import { updateStaffSchema } from '@/lib/validations/admin/staff';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    if (req.method === 'GET') {
        const user = await StaffService.getUserById(id);
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.status(200).json(user);
    } else if (req.method === 'DELETE') {
        await StaffService.deleteUser(id);
        return res.status(200).json({ message: "User deleted" });
    } else if (req.method === 'PUT') {
        const result = updateStaffSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        const updated = await StaffService.updateUser(id, result.data);
        return res.status(200).json(updated);
    }
    return res.status(405).json({ error: "Method not allowed" });
}
