/**
 * Module 9 — Performance Analytics Dashboard
 * Visualizes dynamic student weak zones and subject comprehension metrics
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('PerformanceDashboard');

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return apiError('INVALID_REQUEST' as any, 401, 'Student must be authenticated');
    }

    const metrics = await (prisma as any).performanceMetrics.findUnique({
      where: { userId },
    });

    const quizResults = await prisma.quizResult.findMany({
      where: { userId },
      include: { quiz: { include: { subject: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Compile dynamic scores by subject
    const compiledScores: Record<string, number[]> = {};
    for (const r of quizResults) {
      const sub = r.quiz.subject.name;
      if (!compiledScores[sub]) compiledScores[sub] = [];
      compiledScores[sub].push(r.score);
    }

    const subjectAverages = Object.entries(compiledScores).map(([sub, scores]) => ({
      subject: sub,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      attempts: scores.length,
    }));

    return apiSuccess({
      metrics: metrics || { subjectScores: {}, recentTrend: 0 },
      subjectAverages,
      recentAttempts: quizResults.map((r) => ({
        id: r.id,
        quizTitle: r.quiz.title,
        score: r.score,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    log.error('Performance analytics dashboard error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to fetch performance analytics');
  }
}
