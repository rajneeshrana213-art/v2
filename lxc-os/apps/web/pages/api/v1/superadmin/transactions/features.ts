import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where = {
      planId: null,
      studentId: null,
      schoolId: { not: null },
      description: { startsWith: 'Feature Activation' },
      isDeleted: false,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    // Parse feature name and billing period from description:
    // Format: "Feature Activation (Yearly|Monthly): <featureName>"
    const parsedData = transactions.map((t) => {
      let featureName = '';
      let billingPeriod = '';
      if (t.description) {
        const match = t.description.match(/^Feature Activation \(([^)]+)\):\s*(.+)$/);
        if (match) {
          billingPeriod = match[1]; // "Yearly" or "Monthly"
          featureName = match[2];
        } else {
          featureName = t.description.replace('Feature Activation:', '').trim();
        }
      }

      return {
        id: t.id,
        amount: t.amount,
        razorpayOrderId: t.razorpayOrderId,
        razorpayPaymentId: t.razorpayPaymentId,
        paymentMethod: t.paymentMethod,
        status: t.status,
        paymentDate: t.paymentDate,
        createdAt: t.createdAt,
        featureName,
        billingPeriod,
        school: t.school,
        invoiceNumber: t.invoiceNumber,
        invoiceUrl: t.invoiceUrl,
        receiptUrl: t.receiptUrl,
      };
    });

    return res.status(200).json({
      data: parsedData,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching feature transactions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
