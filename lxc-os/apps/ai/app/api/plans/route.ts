import { apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        planType: 'RIT',
      },
    });

    return apiSuccess({ plans });
  } catch (error: any) {
    console.error('Error fetching RIT plans:', error);
    return apiSuccess({ plans: [], error: error?.message || 'Unknown error' });
  }
}
