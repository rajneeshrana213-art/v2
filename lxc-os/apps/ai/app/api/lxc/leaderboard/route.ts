/**
 * Module 17 — Gamified Streak & XP Metrics
 * Pulls ranking data for student leaderboards based on lifetime reputation (XP) points.
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';

const log = createLogger('Leaderboard');

export async function GET(req: NextRequest) {
  try {
    const topUsers = await prisma.user.findMany({
      where: {
        isDeleted: false,
        reputation: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        profilePic: true,
        reputation: true,
        coins: true,
      },
      orderBy: {
        reputation: 'desc',
      },
      take: 20,
    });

    return apiSuccess({ leaderboard: topUsers });
  } catch (err) {
    log.error('Leaderboard GET error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to fetch leaderboard rankings');
  }
}
