import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { subDays, startOfDay, format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
  }

  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = startOfDay(subDays(new Date(), days - 1));

    // Fetch tickets created in the last N days
    const openedTickets = await prisma.ticket.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: { createdAt: true }
    });

    // Fetch tickets closed/resolved in the last N days
    const closedTickets = await prisma.ticket.findMany({
      where: {
        status: { in: ['RESOLVED', 'CLOSED'] },
        updatedAt: { gte: startDate }
      },
      select: { updatedAt: true }
    });

    // Group by date
    const trendsMap: Record<string, { opened: number; closed: number }> = {};
    
    // Initialize map with all dates
    for (let i = 0; i < days; i++) {
        const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
        trendsMap[dateStr] = { opened: 0, closed: 0 };
    }

    openedTickets.forEach(t => {
      const dateStr = format(t.createdAt, 'yyyy-MM-dd');
      if (trendsMap[dateStr]) {
        trendsMap[dateStr].opened++;
      }
    });

    closedTickets.forEach(t => {
      const dateStr = format(t.updatedAt, 'yyyy-MM-dd');
      if (trendsMap[dateStr]) {
        trendsMap[dateStr].closed++;
      }
    });

    // Convert to sorted array
    const trends = Object.entries(trendsMap)
      .map(([date, counts]) => ({
        date,
        ...counts
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json(trends);
  } catch (error) {
    console.error('Error fetching ticket trends:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
