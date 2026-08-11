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

  if (req.method === 'POST') {
    const { academicYearId, expiresInDays } = req.body;
    try {
      const link = await RegistrationService.generateLink(schoolId, user.id, academicYearId, expiresInDays);
      return res.status(200).json(link);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'GET') {
    const { academicYearId } = req.query;
    try {
      const links = await RegistrationService.getLinks(schoolId, academicYearId as string);
      return res.status(200).json(links);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
