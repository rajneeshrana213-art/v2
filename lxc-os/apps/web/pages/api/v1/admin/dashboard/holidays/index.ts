import { NextApiRequest, NextApiResponse } from 'next';
import { EventService } from '@/lib/services/admin/dashboard/EventService';
import { createHolidaySchema } from '@/lib/validations/admin/scheduling';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
        const { schoolId } = req.query;
        const list = await EventService.getHolidays(schoolId as string);
        return res.status(200).json({ success: true, data: list });
    } else if (req.method === 'POST') {
        const result = createHolidaySchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        const created = await EventService.createHoliday(result.data);
        return res.status(201).json({ success: true, data: created });
    }
    return res.status(405).json({ error: "Method not allowed" });
}
