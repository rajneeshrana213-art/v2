import { NextApiRequest, NextApiResponse } from 'next';
import { EventService } from '@/lib/services/admin/dashboard/EventService';
import { createEventSchema, updateEventSchema } from '@/lib/validations/admin/scheduling';
import { verifyAuth } from "@/lib/auth";

export const config = {
    api: { bodyParser: false } // For upload placeholder
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
        const { schoolId } = req.query;
        try {
            const list = await EventService.getEvents(schoolId as string);
            return res.status(200).json(list);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    } else if (req.method === 'POST') {
        // Upload logic pending. 
        return res.status(501).json({ error: "Upload pending migration" });
    }
    return res.status(405).json({ error: "Method not allowed" });
}
