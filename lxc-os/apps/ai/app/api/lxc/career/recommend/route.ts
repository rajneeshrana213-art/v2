/**
 * Module 12 — Career Discovery & Recommendation
 * Retrieves labor fit recommendations from the CareerRecommendation database table.
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('CareerRecommend');

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return apiError('INVALID_REQUEST' as any, 401, 'Student must be authenticated to retrieve recommendations');
    }

    const recommendations = await (prisma as any).careerRecommendation.findMany({
      where: { userId },
      orderBy: { fitScore: 'desc' },
    });

    // Provide default recommendations if none exist yet for the user
    if (recommendations.length === 0) {
      const defaults = [
        {
          id: 'def-1',
          userId,
          careerPath: 'Full Stack Software Engineer',
          fitScore: 92.5,
          unlocked: true,
          createdAt: new Date(),
        },
        {
          id: 'def-2',
          userId,
          careerPath: 'AI & Data Science Specialist',
          fitScore: 88.0,
          unlocked: true,
          createdAt: new Date(),
        },
        {
          id: 'def-3',
          userId,
          careerPath: 'Cybersecurity Analyst',
          fitScore: 81.2,
          unlocked: false,
          createdAt: new Date(),
        }
      ];

      return apiSuccess({ recommendations: defaults });
    }

    return apiSuccess({ recommendations });
  } catch (err) {
    log.error('Career recommend GET error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to fetch career recommendations');
  }
}
