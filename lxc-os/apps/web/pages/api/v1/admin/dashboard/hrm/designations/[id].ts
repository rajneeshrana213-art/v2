import { NextApiRequest, NextApiResponse } from 'next';
import { HrmService } from '@/lib/services/admin/dashboard/HrmService';
import { updateDesignationSchema } from '@/lib/validations/admin/hrm';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    if (req.method === 'GET') {
        const item = await HrmService.getDesignationById(id);
        if (!item) return res.status(404).json({ error: "Designation not found" });
        return res.status(200).json(item);
    } else if (req.method === 'DELETE') {
        await HrmService.deleteDesignation(id);
        return res.status(204).end();
    } else if (req.method === 'PUT') {
        const result = updateDesignationSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        const updated = await HrmService.updateDesignation(id, result.data);
        return res.status(200).json(updated);
    }
    return res.status(405).json({ error: "Method not allowed" });
}
