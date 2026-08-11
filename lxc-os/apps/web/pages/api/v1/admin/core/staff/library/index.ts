import { NextApiRequest, NextApiResponse } from 'next';
import { StaffService } from '@/lib/services/admin/core/StaffService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
        const list = await StaffService.getLibrarians();
        return res.status(200).json(list);
    }
    return res.status(405).json({ error: "Method not allowed" });
}
