import { NextApiRequest, NextApiResponse } from 'next';
import { RegistrationService } from '@/lib/services/admin/core/RegistrationService';
import { prisma } from '@/lib/prisma';
import { cors } from '@/lib/middleware/cors';

// Public endpoint: intentionally accessible without session authentication.
// The registration token link is distributed by the school to prospective
// students. Validating that token (and returning school metadata) does not
// require the caller to have an existing authenticated session.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const link = await RegistrationService.validateToken(token as string);
    
    // Fetch classes for this school publicly
    const classes = await prisma.class.findMany({
      where: { schoolId: link.schoolId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      schoolId: link.schoolId,
      schoolName: link.school.schoolName,
      schoolLogo: link.school.schoolLogo,
      academicYear: link.academicYear,
      classes: classes,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
