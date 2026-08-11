import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: id as string },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            profilePic: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
            profilePic: true,
            phone: true,
          },
        },
        employee: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Security check: only allow school admin of the same school or superadmin
    if (user.role !== Role.superadmin && ticket.schoolId !== user.schoolId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
