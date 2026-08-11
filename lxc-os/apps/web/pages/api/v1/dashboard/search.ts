import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuth(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(200).json({ results: [] });
  }

  try {
    const searchString = query.trim();
    const isNumeric = /^\d+$/.test(searchString);
    const mode = 'insensitive' as const;

    // Run searches in parallel
    const [tickets, users, schools, classes, subjects, leads] = await Promise.all([
      // Search Tickets
      (async () => {
        try {
          return await prisma.ticket.findMany({
            where: {
              OR: [
                { title: { contains: searchString, mode } },
                { description: { contains: searchString, mode } },
                ...(isNumeric ? [{ ticketNumber: parseInt(searchString) }] : []),
              ],
              ...(user.schoolId ? { schoolId: user.schoolId } : {}),
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
          });
        } catch (e) {
          console.error('Error searching tickets:', e);
          return [];
        }
      })(),

      // Search Users
      (async () => {
        try {
          return await prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: searchString, mode } },
                { email: { contains: searchString, mode } },
              ],
              ...(user.schoolId ? { schoolId: user.schoolId } : {}),
            },
            take: 5,
          });
        } catch (e) {
          console.error('Error searching users:', e);
          return [];
        }
      })(),

      // Search Schools
      user.role === 'superadmin' 
        ? (async () => {
            try {
              return await prisma.school.findMany({
                where: {
                  OR: [
                    { schoolName: { contains: searchString, mode } },
                    { schoolCode: { contains: searchString, mode } },
                  ],
                },
                take: 5,
              });
            } catch (e) {
              console.error('Error searching schools:', e);
              return [];
            }
          })()
        : Promise.resolve([]),

      // Search Classes
      user.schoolId 
        ? (async () => {
            try {
              return await prisma.class.findMany({
                where: {
                  name: { contains: searchString, mode },
                  schoolId: user.schoolId,
                },
                take: 5,
              });
            } catch (e) {
              console.error('Error searching classes:', e);
              return [];
            }
          })()
        : Promise.resolve([]),

      // Search Subjects
      user.schoolId
        ? (async () => {
            try {
              return await prisma.subject.findMany({
                where: {
                  name: { contains: searchString, mode },
                  schoolId: user.schoolId,
                },
                take: 5,
              });
            } catch (e) {
              console.error('Error searching subjects:', e);
              return [];
            }
          })()
        : Promise.resolve([]),

      // Search Leads
      ['superadmin', 'employee'].includes(user.role)
        ? (async () => {
            try {
              return await prisma.lead.findMany({
                where: {
                  OR: [
                    { name: { contains: searchString, mode } },
                    { email: { contains: searchString, mode } },
                  ],
                },
                take: 5,
              });
            } catch (e) {
              console.error('Error searching leads:', e);
              return [];
            }
          })()
        : Promise.resolve([]),
    ]);

    // Map results to a standard format
    const results = [
      ...tickets.map(t => ({
        id: t.id,
        title: `Ticket #${t.ticketNumber}: ${t.title}`,
        type: 'Ticket',
        href: user.role === 'superadmin' 
          ? `/dashboard/superadmin/support-tickets` 
          : `/dashboard/${user.role}/support-tickets`,
        description: t.status,
      })),
      ...users.map(u => ({
        id: u.id,
        title: u.name,
        type: 'User',
        href: `/dashboard/profile?id=${u.id}`,
        description: u.role,
      })),
      ...schools.map(s => ({
        id: s.id,
        title: s.schoolName,
        type: 'School',
        href: `/dashboard/superadmin/schools?id=${s.id}`,
        description: s.schoolCode,
      })),
      ...classes.map(c => ({
        id: c.id,
        title: `Class: ${c.name}`,
        type: 'Class',
        href: `/dashboard/admin/classes`, // General classes page
        description: `Room: ${c.roomNumber || 'N/A'}`,
      })),
      ...subjects.map(s => ({
        id: s.id,
        title: `Subject: ${s.name}`,
        type: 'Subject',
        href: `/dashboard/admin/subjects`,
        description: s.code,
      })),
      ...leads.map(l => ({
        id: l.id,
        title: `Lead: ${l.name}`,
        type: 'Lead',
        href: user.role === 'superadmin' 
          ? `/dashboard/superadmin/leads` 
          : `/dashboard/employee/leads`,
        description: l.status,
      })),
    ];

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
