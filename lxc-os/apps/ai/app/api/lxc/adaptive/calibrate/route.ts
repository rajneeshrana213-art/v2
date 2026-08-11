/**
 * Module 4 — Adaptive Engine Calibration
 * Calculates and updates IRT theta ability and beta difficulty parameters
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('AdaptiveEngine');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { score, totalQuestions = 5, avgDifficulty = 5 } = body;

    if (score === undefined) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Score is required');
    }

    const pct = score / totalQuestions;
    // Basic IRT calibration step
    let thetaChange = (pct - 0.5) * 2; // -1.0 to 1.0 ability shift

    let savedState = null;
    if (userId) {
      const currentState = await (prisma as any).adaptiveState.findUnique({ where: { userId } });
      const newTheta = Math.max(-3.0, Math.min(3.0, (currentState?.theta || 0.0) + thetaChange));

      savedState = await (prisma as any).adaptiveState.upsert({
        where: { userId },
        update: {
          theta: newTheta,
          beta: avgDifficulty,
          lastCalibrated: new Date(),
        },
        create: {
          userId,
          theta: newTheta,
          beta: avgDifficulty,
        },
      });
    }

    return apiSuccess({
      state: savedState || { theta: thetaChange, beta: avgDifficulty },
    });
  } catch (err) {
    log.error('Adaptive engine error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to calibrate adaptive state');
  }
}
