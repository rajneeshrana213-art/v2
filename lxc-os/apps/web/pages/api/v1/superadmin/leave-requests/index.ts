import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  try {
    const { search, startDate, endDate, status, page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // 1. Build dynamic where clause
    const where: any = {
      user: {
        role: 'employee'
      }
    };

    if (search) {
      where.OR = [
        { user: { name: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        { user: { Employee: { employeeCode: { contains: search as string, mode: 'insensitive' } } } },
      ];
    }

    if (startDate || endDate) {
      where.AND = where.AND || [];
      if (startDate) {
        where.AND.push({ fromDate: { gte: new Date(startDate as string) } });
      }
      if (endDate) {
        where.AND.push({ toDate: { lte: new Date(endDate as string) } });
      }
    }

    if (status && status !== 'ALL') {
      where.isApproved = status;
    }
    
    // Helper to merge where clauses for stats (keep stats global or filtered?)
    // Usually stats are global for the overview card, but for consistency 
    // let's keep them based on role at least.
    const baseWhere: any = { user: { role: 'employee' } };
    const wherePending = { ...baseWhere, isApproved: 'PENDING' };
    const whereApproved = { ...baseWhere, isApproved: 'APPROVED' };
    const whereRejected = { ...baseWhere, isApproved: 'REJECTED' };

    const [totalRequests, pendingRequests, approvedRequests, rejectedRequests, filteredTotal] = await Promise.all([
      prisma.leaveRequest.count({ where: baseWhere }),
      prisma.leaveRequest.count({ where: wherePending }),
      prisma.leaveRequest.count({ where: whereApproved }),
      prisma.leaveRequest.count({ where: whereRejected }),
      prisma.leaveRequest.count({ where }),
    ]);

    // 2. Fetch Requests with filters applied
    const requests = await prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
            role: true,
            Employee: {
              select: {
                employeeCode: true,
                designation: { select: { name: true } },
                department: { select: { name: true } }
              }
            }
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
            role: true,
          }
        }
      },
    });

    return res.status(200).json({
      stats: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
      },
      requests,
      pagination: {
        total: filteredTotal,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(filteredTotal / Number(limit)),
      }
    });

  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
}
