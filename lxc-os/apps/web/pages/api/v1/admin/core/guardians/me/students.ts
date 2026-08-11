import { NextApiRequest, NextApiResponse } from 'next';
import { GuardianService } from '@/lib/services/admin/core/GuardianService';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req, res);
  if (!user) return;
  
  const userId = user.id;

  try {
    const data = await GuardianService.getStudentsByAuthenticatedGuardian(userId);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
