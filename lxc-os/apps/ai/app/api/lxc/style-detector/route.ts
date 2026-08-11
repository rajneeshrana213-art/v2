/**
 * Module 7 — Learning Style Detector
 * Telemetry endpoint classifying student visual/auditory/read-write preferences
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('StyleDetector');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { videoViewDuration = 0, textScrollSpikes = 0, audioListenDuration = 0 } = body;

    let styleType = 'READ_WRITE';
    let confidence = 0.7;

    if (videoViewDuration > audioListenDuration && videoViewDuration > textScrollSpikes) {
      styleType = 'VISUAL';
      confidence = 0.85;
    } else if (audioListenDuration > videoViewDuration && audioListenDuration > textScrollSpikes) {
      styleType = 'AUDIO';
      confidence = 0.8;
    }

    let savedStyle = null;
    if (userId) {
      savedStyle = await (prisma as any).learningStyle.upsert({
        where: { userId },
        update: {
          styleType,
          confidence,
          lastInteraction: new Date(),
        },
        create: {
          userId,
          styleType,
          confidence,
          lastInteraction: new Date(),
        },
      });
    }

    return apiSuccess({
      style: savedStyle || { styleType, confidence },
    });
  } catch (err) {
    log.error('Style detector error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to process telemetry style');
  }
}
