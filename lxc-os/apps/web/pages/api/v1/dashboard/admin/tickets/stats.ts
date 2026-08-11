import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { Role, TicketStatus } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== Role.admin && user.role !== Role.superadmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const schoolId = user.schoolId;
  if (!schoolId && user.role !== Role.superadmin) {
    return res.status(400).json({ message: 'User not associated with a school' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const where: any = schoolId ? { schoolId } : {};

    const [total, open, inProgress, resolved, closed] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: TicketStatus.OPEN } }),
      prisma.ticket.count({ where: { ...where, status: TicketStatus.IN_PROGRESS } }),
      prisma.ticket.count({ where: { ...where, status: TicketStatus.RESOLVED } }),
      prisma.ticket.count({ where: { ...where, status: TicketStatus.CLOSED } }),
    ]);

    return res.status(200).json({
      total,
      open,
      inProgress,
      resolved,
      closed,
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
