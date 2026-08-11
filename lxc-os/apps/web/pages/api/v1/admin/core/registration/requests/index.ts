import { NextApiRequest, NextApiResponse } from 'next';
import { RegistrationService } from '@/lib/services/admin/core/RegistrationService';
import { verifyAuth } from '@/lib/auth';
import { cors } from '@/lib/middleware/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const schoolId = user.schoolId;

  if (!schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  const { status, page, limit, academicYearId } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await RegistrationService.getRequests(
        schoolId,
        academicYearId as string,
        status as string,
        Number(page || 1),
        Number(limit || 10)
      );
      return res.status(200).json(result);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
