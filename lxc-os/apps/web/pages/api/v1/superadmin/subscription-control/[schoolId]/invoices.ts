import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { schoolId } = req.query;

  if (!schoolId || typeof schoolId !== 'string') {
    return res.status(400).json({ message: 'Invalid school ID' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  try {
    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const invoices = await prisma.payment.findMany({
      where: {
        OR: [
          { schoolId },
          { 
            subscription: {
              some: {
                schoolId
              }
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: {
            name: true,
          }
        }
      }
    });

    // Transform and add metadata like 'type' (Base, Feature, Overage)
    // For now, based on existing data, most will be 'Base' or 'Subscription'
    const transformedInvoices = invoices.map(inv => ({
      id: inv.id,
      amount: inv.amount,
      status: inv.status,
      // For UI compatibility, expose createdAt and invoiceNumber/invoiceUrl
      createdAt: inv.paymentDate || inv.createdAt,
      method: inv.paymentMethod,
      type: inv.planId ? 'Plan Subscription' : 'Miscellaneous',
      description: inv.description || `Payment for ${inv.plan?.name || 'School Services'}`,
      invoiceNumber: inv.invoiceNumber,
      invoiceUrl: inv.invoiceUrl,
      receiptUrl: inv.receiptUrl,
    }));

    return res.status(200).json(transformedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
