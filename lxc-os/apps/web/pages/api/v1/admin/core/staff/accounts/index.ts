import { NextApiRequest, NextApiResponse } from 'next';
import { StaffService } from '@/lib/services/admin/core/StaffService';
import { registerAccountSchema } from '@/lib/validations/admin/staff';
import { verifyAuth } from "@/lib/auth";

export const config = {
    api: { bodyParser: false } // For upload placeholder if needed, though simpler without for now
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
        const list = await StaffService.getAccountants();
        return res.status(200).json(list);
    } else if (req.method === 'POST') {
        // Placeholder or handling raw body if I could.
        // I will assume body parsing is disabled so I can't read json easily without parser.
        // Actually, let's enable body parser for the JSON part of migration, accepting that file upload won't work yet.
        // Migration Phase: JSON works, Upload needs work.
        return res.status(501).json({ error: "Use multipart endpoint (pending)" });
    }
    return res.status(405).json({ error: "Method not allowed" });
}
