import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { SubscriptionService } from '@/lib/services/superadmin/SubscriptionService';
import { sendSubscriptionReminder } from '@/lib/services/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { schoolId } = req.query;

  if (!schoolId || typeof schoolId !== 'string') {
    return res.status(400).json({ message: 'Invalid school ID' });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  if (req.method === 'POST') {
    const { action, paymentId } = req.body;

    if (!action) return res.status(400).json({ message: 'Action is required' });

    try {
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: { user: { select: { email: true, name: true } } }
      });

      if (!school) return res.status(404).json({ message: 'School not found' });

      switch (action) {
        case 'MARK_PAID':
          if (!paymentId) return res.status(400).json({ message: 'Payment ID is required' });
          await prisma.payment.update({
            where: { id: paymentId },
            data: { 
                status: 'COMPLETED',
                paymentDate: new Date(),
            },
          });
          // Also update associated subscription if any
          await prisma.subscription.updateMany({
            where: { paymentId },
            data: { status: 'ACTIVE' },
          });
          return res.status(200).json({ message: 'Payment marked as completed' });

        case 'SEND_REMINDER':
          if (school.user?.email) {
            await sendSubscriptionReminder(
                school.user.email,
                school.schoolName,
                "This is a reminder regarding your school's subscription status or usage limits. Please review your billing dashboard for details."
            );
          }
          return res.status(200).json({ message: 'Reminder sent to school owner' });

        case 'WAIVE_OVERAGE':
          await SubscriptionService.waiveOverage(schoolId);
          return res.status(200).json({ message: 'Current overage waived successfully' });

        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
    } catch (error) {
      console.error('Error performing billing action:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
