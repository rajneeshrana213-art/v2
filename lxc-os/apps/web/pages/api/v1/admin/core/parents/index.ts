import { NextApiRequest, NextApiResponse } from 'next';
import { ParentService } from '@/lib/services/admin/core/ParentService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { schoolId } = req.query;
  if (!schoolId || typeof schoolId !== 'string') return res.status(400).json({ error: "School ID required" });

  try {
    const parents = await ParentService.getParentsBySchool(schoolId);
    return res.status(200).json({ success: true, data: parents });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
