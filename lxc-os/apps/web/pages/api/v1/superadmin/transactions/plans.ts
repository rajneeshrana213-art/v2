import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where = {
      planId: { not: null },
    };

    const [transactions, totalItems] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          school: {
            select: {
              schoolName: true,
              schoolLogo: true,
            },
          },
          plan: {
            select: {
              name: true,
              price: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return res.status(200).json({
      data: transactions,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching plan transactions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
