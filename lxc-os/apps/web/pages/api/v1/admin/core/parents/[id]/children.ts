import { NextApiRequest, NextApiResponse } from 'next';
import { ParentService } from '@/lib/services/admin/core/ParentService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query; // Parent ID
  if (!id || typeof id !== 'string') return res.status(400).json({ error: "Parent ID required" });

  try {
    const data = await ParentService.getChildrenByParent(id);
    if (!data) return res.status(404).json({ success: false, message: "Parent not found" });
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
