/**
 * Module 20 — Hinglish Voice AI transcription logs
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('HinglishVoiceAI');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { audioUrl = 'mock-audio-url.wav', transcription, confidence = 0.95 } = body;

    if (!transcription || !transcription.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Transcription string is required');
    }

    let voiceLog = null;
    if (userId) {
      voiceLog = await (prisma as any).hinglishVoiceLogs.create({
        data: {
          userId,
          audioUrl,
          transcription: transcription.trim(),
          confidence,
        },
      });
    }

    return apiSuccess({
      voiceLog,
      status: 'Logged transcription successfully',
    });
  } catch (err) {
    log.error('Hinglish voice AI error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to process voice transcription');
  }
}
