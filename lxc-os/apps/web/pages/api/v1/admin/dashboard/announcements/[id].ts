import { NextApiRequest, NextApiResponse } from 'next';
import { CommunicationService } from '@/lib/services/admin/dashboard/CommunicationService';
import { updateAnnouncementSchema } from '@/lib/validations/admin/communication';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    if (req.method === 'GET') {
        const item = await CommunicationService.getAnnouncementById(id);
        if (!item) return res.status(404).json({ error: "Announcement not found" });
        return res.status(200).json(item);
    } else if (req.method === 'DELETE') {
        await CommunicationService.deleteAnnouncement(id);
        return res.status(200).json({ message: "Announcement deleted" });
    } else if (req.method === 'PUT') {
        const result = updateAnnouncementSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        const updated = await CommunicationService.updateAnnouncement(id, result.data);
        return res.status(200).json(updated);
    }
    return res.status(405).json({ error: "Method not allowed" });
}
