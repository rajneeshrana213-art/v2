import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { schoolName: { contains: search, mode: 'insensitive' } },
        { 
          user: { 
            city: { contains: search, mode: 'insensitive' } 
          } 
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [total, schools] = await Promise.all([
      prisma.school.count({ where: whereClause }),
      prisma.school.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              city: true,
              state: true,
            },
          },
          _count: {
            select: {
              students: true,
              teachers: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      data: schools,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
}
