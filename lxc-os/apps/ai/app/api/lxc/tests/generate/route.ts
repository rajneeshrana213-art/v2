/**
 * Module 5 — Practice Tests Mock Generator
 * Generates custom boards/JEE/NEET examination templates
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('PracticeTestsGen');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { subject = 'General', difficulty = 'MEDIUM', count = 5 } = body;

    const { model } = resolveModelFromHeaders(req);

    const prompt = `You are a test builder for Indian secondary education. Generate a practice quiz test with ${count} multiple-choice questions on subject ${subject} with difficulty ${difficulty}.

Return ONLY valid JSON in this format:
{
  "title": "Practice Quiz - ${subject}",
  "questions": [
    {
      "questionText": "The question content",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ]
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.5,
      maxOutputTokens: 2000,
    });

    let parsed;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result.text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse generated practice test');
    }

    // Save to pre-existing Quiz and QuizQuestion tables if authenticated
    let savedQuiz = null;
    if (userId) {
      try {
        const student = await prisma.student.findFirst({ where: { userId } });
        if (student && student.schoolId) {
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

          savedQuiz = await prisma.quiz.create({
            data: {
              title: parsed.title,
              classId,
              subjectId: dbSubject.id,
              difficulty,
              startDate: new Date(),
              endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
          });

          for (const q of parsed.questions || []) {
            await prisma.quizQuestion.create({
              data: {
                quizId: savedQuiz.id,
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
              }
            });
          }
        }
      } catch (dbErr) {
        log.error('Failed to save generated quiz in DB', dbErr);
      }
    }

    return apiSuccess({
      quiz: savedQuiz || parsed,
      questions: parsed.questions,
    });
  } catch (err) {
    log.error('Practice test generation error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to generate practice test');
  }
}
