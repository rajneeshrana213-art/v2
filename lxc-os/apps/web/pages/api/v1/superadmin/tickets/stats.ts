import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
  }

  try {
    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      unassigned,
      priorityCounts,
      resolvedTickets
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { status: 'CLOSED' } }),
      prisma.ticket.count({ where: { employeeId: null } }),
      prisma.ticket.groupBy({
        by: ['priority'],
        _count: { priority: true },
      }),
      prisma.ticket.findMany({
        where: {
          status: { in: ['RESOLVED', 'CLOSED', 'IN_PROGRESS'] }
        },
        select: {
          createdAt: true,
          updatedAt: true,
          status: true
        }
      })
    ]);

    // Format priority distribution
    const ticketsByPriority: Record<string, number> = {
      URGENT: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
    priorityCounts.forEach(p => {
      ticketsByPriority[p.priority] = p._count.priority;
    });

    // Calculate Averages
    let totalResTime = 0;
    let resCount = 0;
    let totalRespTime = 0;
    let respCount = 0;

    resolvedTickets.forEach(t => {
      const timeDiff = (t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60); // Hours
      
      if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
        totalResTime += timeDiff;
        resCount++;
      }
      
      if (t.status === 'IN_PROGRESS') {
        totalRespTime += timeDiff;
        respCount++;
      }
    });

    const avgResolutionTime = resCount > 0 ? totalResTime / resCount : 0;
    const avgResponseTime = respCount > 0 ? totalRespTime / respCount : 0;

    return res.status(200).json({
      total,
      open,
      inProgress,
      resolved,
      closed,
      unassigned,
      avgResolutionTime,
      avgResponseTime,
      ticketsByPriority,
      ticketsByStatus: {
        OPEN: open,
        IN_PROGRESS: inProgress,
        RESOLVED: resolved,
        CLOSED: closed
      }
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
