import { NextApiRequest, NextApiResponse } from 'next';
import { RegistrationService } from '@/lib/services/admin/core/RegistrationService';
import { verifyAuth } from '@/lib/auth';
import { cors } from '@/lib/middleware/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;

  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
  
  const { id } = req.query;
  const { reason } = req.body;

  try {
     const result = await RegistrationService.rejectRequest(id as string, reason, user.id);
     return res.status(200).json(result);
  } catch (e: any) {
     return res.status(500).json({ error: e.message });
  }
}
