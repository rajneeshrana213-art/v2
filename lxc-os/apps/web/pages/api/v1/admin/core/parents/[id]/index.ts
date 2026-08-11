import { NextApiRequest, NextApiResponse } from 'next';
import { ParentService } from '@/lib/services/admin/core/ParentService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Parent ID required" });
  }

  if (req.method === 'GET') {
    try {
      const parent = await ParentService.getParentById(id);
      if (!parent) return res.status(404).json({ success: false, message: "Parent not found" });
      return res.status(200).json({ success: true, data: parent });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await ParentService.deleteParent(id);
      return res.status(200).json({ success: true, message: "Parent deleted" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
