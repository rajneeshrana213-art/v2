import { NextApiRequest, NextApiResponse } from 'next';
import { EventService } from '@/lib/services/admin/dashboard/EventService';
import { updateHolidaySchema } from '@/lib/validations/admin/scheduling';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    if (req.method === 'GET') {
        const item = await EventService.getHolidayById(id);
        if (!item) return res.status(404).json({ error: "Holiday not found" });
        return res.status(200).json({ success: true, data: item });
    } else if (req.method === 'DELETE') {
        await EventService.deleteHoliday(id);
        return res.status(200).json({ success: true, message: "Holiday deleted" });
    } else if (req.method === 'PUT') {
        const result = updateHolidaySchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        const updated = await EventService.updateHoliday(id, result.data);
        return res.status(200).json({ success: true, data: updated });
    }
    return res.status(405).json({ error: "Method not allowed" });
}
