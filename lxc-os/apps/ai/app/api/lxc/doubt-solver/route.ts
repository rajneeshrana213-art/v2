/**
 * Module 3 — Doubt Solver AI Engine
 * Resolves doubts using LLM semantic retrieval and writes logs to database tables
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('DoubtSolverAI');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { query, subject = 'General', chapter = 'General', voiceLogId = null } = body;

    if (!query || !query.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Query content is required');
    }

    const { model } = resolveModelFromHeaders(req);

    const prompt = `You are a world-class doubt solver expert. Resolve the following student question with high-quality step-by-step LaTeX math notation and rich pedagogical explanations.

Subject: ${subject}
Chapter: ${chapter}
Question:
${query}

Format mathematical equations cleanly using standard LaTeX (e.g. \\( x^2 + y^2 = r^2 \\) or $$ \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a} $$). End with a quick reinforcement recall question for the student.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.6,
      maxOutputTokens: 2500,
    });

    // Save to PostgreSQL Doubt & DoubtReply telemetry tables if authenticated
    if (userId) {
      try {
        const student = await prisma.student.findFirst({ where: { userId } });
        if (student) {
          const classId = student.classId || 'default-class';
          
          // Map or resolve subject
          const dbSubject = await prisma.subject.findFirst({
            where: { name: subject, classId }
          }) || await prisma.subject.create({
            data: {
              name: subject,
              code: subject.toUpperCase().substring(0, 5),
              type: 'theory',
              classId,
              schoolId: student.schoolId
            }
          });

          const doubt = await prisma.doubt.create({
            data: {
              title: query.substring(0, 50) + '...',
              content: query,
              classId,
              subjectId: dbSubject.id,
              userId,
              status: 'ANSWERED',
              difficulty: 'MEDIUM',
              chapter,
            }
          });

          await prisma.doubtReply.create({
            data: {
              doubtId: doubt.id,
              userId,
              role: 'teacher' as any, // Resolved by AI teacher
              content: result.text,
              isAccepted: true,
            }
          });
        }
      } catch (dbErr) {
        log.error('Failed to log telemetry in Doubt tables', dbErr);
      }
    }

    return apiSuccess({
      answer: result.text,
      subject,
      chapter,
    });
  } catch (err) {
    log.error('Doubt solver error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to resolve doubt');
  }
}
