import { NextApiRequest, NextApiResponse } from 'next';
import { CommunicationService } from '@/lib/services/admin/dashboard/CommunicationService';
import { createAnnouncementSchema } from '@/lib/validations/admin/communication';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
        const list = await CommunicationService.getAnnouncements();
        return res.status(200).json(list);
    } else if (req.method === 'POST') {
        const result = createAnnouncementSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        const created = await CommunicationService.createAnnouncement(result.data);
        return res.status(201).json(created);
    }
    return res.status(405).json({ error: "Method not allowed" });
}
