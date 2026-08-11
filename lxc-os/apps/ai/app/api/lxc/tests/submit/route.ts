/**
 * Module 5 — Practice Tests Submission Evaluator
 * Validates quiz scores and registers them to QuizResult database table
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('PracticeTestsSubmit');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { quizId, score } = body;

    if (!quizId || score === undefined) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'QuizId and score are required');
    }

    let savedResult = null;
    if (userId) {
      savedResult = await prisma.quizResult.create({
        data: {
          userId,
          quizId,
          score,
        },
      });

      // Save dynamic Performance Metrics
      try {
        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          include: { subject: true },
        });

        if (quiz) {
          const subjectScores: Record<string, number[]> = {};
          subjectScores[quiz.subject.name] = [score];

          await (prisma as any).performanceMetrics.upsert({
            where: { userId },
            update: {
              subjectScores: subjectScores as any,
              recentTrend: score,
              lastAggregated: new Date(),
            },
            create: {
              userId,
              subjectScores: subjectScores as any,
              recentTrend: score,
            },
          });
        }
      } catch (pmErr) {
        log.error('Failed to update Performance Metrics', pmErr);
      }
    }

    return apiSuccess({
      result: savedResult || { userId, quizId, score },
      status: 'Test submitted and performance updated successfully',
    });
  } catch (err) {
    log.error('Practice test submission error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to submit practice test');
  }
}
