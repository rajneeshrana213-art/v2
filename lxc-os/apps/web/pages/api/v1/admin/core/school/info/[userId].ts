import { NextApiRequest, NextApiResponse } from 'next';
import { SchoolService } from '@/lib/services/admin/core/SchoolService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { userId } = req.query;
  // TODO: Add proper auth middleware to verify requester has access to this data?
  // Legacy code only checked token existence, not permission to view OTHER user's info.
  
  if (!userId || typeof userId !== 'string') return res.status(400).json({ error: "User ID required" });

  if (req.method === 'GET') {
      try {
          const info = await SchoolService.getSchoolInfoByUserId(userId);
          return res.status(200).json(info);
      } catch (e: any) {
          return res.status(500).json({ error: e.message });
      }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
