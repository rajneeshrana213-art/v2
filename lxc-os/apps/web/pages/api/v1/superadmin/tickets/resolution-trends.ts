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

    // Fetch resolved/closed tickets in the last N days
    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        status: { in: ['RESOLVED', 'CLOSED'] },
        updatedAt: { gte: startDate }
      },
      select: { 
        createdAt: true, 
        updatedAt: true 
      }
    });

    // Group by date and calculate average resolution time
    const trendsMap: Record<string, { totalHours: number; count: number }> = {};
    
    // Initialize map with all dates
    for (let i = 0; i < days; i++) {
        const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
        trendsMap[dateStr] = { totalHours: 0, count: 0 };
    }

    resolvedTickets.forEach(t => {
      const dateStr = format(t.updatedAt, 'yyyy-MM-dd');
      if (trendsMap[dateStr]) {
        const hours = (t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
        trendsMap[dateStr].totalHours += hours;
        trendsMap[dateStr].count++;
      }
    });

    // Convert to sorted array and calculate average
    const trends = Object.entries(trendsMap)
      .map(([date, stats]) => ({
        date,
        avgHours: stats.count > 0 ? parseFloat((stats.totalHours / stats.count).toFixed(2)) : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json(trends);
  } catch (error) {
    console.error('Error fetching resolution trends:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
