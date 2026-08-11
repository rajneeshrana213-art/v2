/**
 * Module 10 — Failure Alert AI Engine
 * Aggregates student dropout risk and capability alerts for teachers/mentors
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('FailureRiskAlerts');

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return apiError('INVALID_REQUEST' as any, 401, 'Student must be authenticated');
    }

    // Dynamic failure risk rule check (average quiz score < 60% flags risk)
    const quizResults = await prisma.quizResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const averageScore = quizResults.length
      ? quizResults.reduce((a, b) => a + b.score, 0) / quizResults.length
      : 80;

    let riskLevel = 'LOW';
    let riskScore = 0.1;
    const factors = [];

    if (averageScore < 60) {
      riskLevel = 'HIGH';
      riskScore = 0.85;
      factors.push('Low test scores in consecutive practice mock examinations.');
    } else if (averageScore < 70) {
      riskLevel = 'MEDIUM';
      riskScore = 0.55;
      factors.push('Inconsistent performance on recent adaptive quizzes.');
    }

    let activeAlert = null;
    if (userId && riskLevel !== 'LOW') {
      activeAlert = await (prisma as any).failureRiskAlert.create({
        data: {
          userId,
          riskScore,
          riskLevel,
          factors,
        },
      });
    }

    return apiSuccess({
      alert: activeAlert || { userId, riskScore, riskLevel, factors, resolved: false },
      status: 'Dropout risk metrics analyzed successfully',
    });
  } catch (err) {
    log.error('Failure risk alerts engine error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to resolve failure risk alerts');
  }
}
