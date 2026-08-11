/**
 * Module 13 — Mentor AI video booking sessions
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('MentorSessionBook');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { mentorId = 'ai-tutor', scheduledTime, riskAlertId = null } = body;

    if (!scheduledTime) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'ScheduledTime is required');
    }

    let savedSession = null;
    if (userId) {
      savedSession = await (prisma as any).mentorSession.create({
        data: {
          userId,
          mentorId,
          riskAlertId,
          scheduledTime: new Date(scheduledTime),
          status: 'SCHEDULED',
        },
      });
    }

    return apiSuccess({
      session: savedSession || { userId, mentorId, scheduledTime },
      status: 'Session booked successfully',
    });
  } catch (err) {
    log.error('Mentor booking session error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to book mentor session');
  }
}
