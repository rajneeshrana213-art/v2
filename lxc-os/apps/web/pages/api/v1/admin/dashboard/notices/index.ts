import { NextApiRequest, NextApiResponse } from 'next';
import { CommunicationService } from '@/lib/services/admin/dashboard/CommunicationService';
import { createNoticeSchema } from '@/lib/validations/admin/communication';
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
            const list = await CommunicationService.getNotices(schoolId as string);
            const transformed = list.map(n => ({
                ...n,
                content: n.message // Map message to content for admin frontend
            }));
            return res.status(200).json({ success: true, data: transformed });
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    } else if (req.method === 'POST') {
         return res.status(501).json({ error: "Upload pending migration" });
    }
    return res.status(405).json({ error: "Method not allowed" });
}
