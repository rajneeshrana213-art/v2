import { NextApiRequest, NextApiResponse } from 'next';
import { CommunicationService } from '@/lib/services/admin/dashboard/CommunicationService';
import { updateNoticeSchema } from '@/lib/validations/admin/communication';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    if (req.method === 'GET') {
        const item = await CommunicationService.getNoticeById(id);
        if (!item) return res.status(404).json({ error: "Notice not found" });
        return res.status(200).json({ success: true, data: item });
    } else if (req.method === 'DELETE') {
        await CommunicationService.deleteNotice(id);
        return res.status(200).json({ success: true, message: "Notice deleted" });
    } else if (req.method === 'PUT') {
        const result = updateNoticeSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        const updated = await CommunicationService.updateNotice(id, result.data);
        return res.status(200).json({ success: true, data: updated });
    }
    return res.status(405).json({ error: "Method not allowed" });
}
