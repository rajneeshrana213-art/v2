/**
 * Module 11 — Focus AI Sessions
 * Logs completed Pomodoro focus duration and distractions
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('FocusAISession');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { durationSeconds, distractionSpikes, focusScore } = body;

    if (durationSeconds === undefined || distractionSpikes === undefined) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Duration and distraction spikes are required');
    }

    let savedSession = null;
    if (userId) {
      savedSession = await (prisma as any).focusSession.create({
        data: {
          userId,
          durationSeconds,
          distractionSpikes,
          focusScore: focusScore !== undefined ? focusScore : Math.max(0, 100 - distractionSpikes * 5),
        },
      });

      // Award XP
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            reputation: {
              increment: Math.round(durationSeconds / 60), // 1 XP per minute
            },
          },
        });
      } catch (xpErr) {
        log.error('Failed to increment XP for focus session', xpErr);
      }
    }

    return apiSuccess({
      session: savedSession || { userId, durationSeconds, distractionSpikes },
      status: 'Focus session registered successfully',
    });
  } catch (err) {
    log.error('Focus session error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to log focus session');
  }
}
