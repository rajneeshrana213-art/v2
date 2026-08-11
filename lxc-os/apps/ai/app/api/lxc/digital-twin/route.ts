/**
 * Module 8 — Digital Twin Student Model
 * Creates a dynamic AI model of the student's knowledge state, learning style,
 * strengths/gaps — used to predict performance and personalize everything
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('DigitalTwin');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const {
      profile,
      studySessions = [],
      quizHistory = [],
      careerProfile = null,
      language = 'english',
    } = body;

    if (!profile) {
      return apiError('MISSING_PROFILE', 400, 'Student profile required');
    }

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'Respond in Hindi.'
        : language === 'hinglish'
          ? 'Respond in Hinglish.'
          : 'Respond in English.';

    const sessionSummary =
      studySessions
        .slice(0, 20)
        .map(
          (s: { subject: string; topic: string; durationMinutes: number; quizScore?: number }) =>
            `${s.subject}/${s.topic}: ${s.durationMinutes}min${s.quizScore !== undefined ? `, score: ${s.quizScore}%` : ''}`,
        )
        .join('\n') || 'No sessions yet';

    const avgScore = quizHistory.length
      ? Math.round(quizHistory.reduce((a: number, b: number) => a + b, 0) / quizHistory.length)
      : null;

    const prompt = `You are an AI cognitive scientist building a digital twin model of a student.

${langInstruction}

Student Profile:
- Name: ${profile.name}
- Class: ${profile.class}, Board: ${profile.board}
- Subjects: ${profile.subjects?.join(', ')}
- Study hours/day: ${profile.studyHoursPerDay}h
- Language: ${profile.language}

Learning Data:
- Total sessions: ${studySessions.length}
- Recent sessions:
${sessionSummary}
- Average quiz score: ${avgScore !== null ? `${avgScore}%` : 'No quizzes yet'}
- Career interests: ${careerProfile?.interests?.join(', ') || 'Not assessed'}

Build a comprehensive Digital Twin analysis as JSON:
{
  "twinId": "A unique ID for this twin snapshot",
  "overallLearnerType": "Visual / Auditory / Reading-Writing / Kinesthetic",
  "learningPersonality": "The student's learning archetype (e.g., 'Determined Marathon Runner', 'Curious Explorer')",
  "knowledgeMap": {
    "strongSubjects": ["Subject with why"],
    "weakSubjects": ["Subject with why"],
    "criticalGaps": ["Most urgent knowledge gap 1", "Gap 2"]
  },
  "cognitiveProfile": {
    "memoryStrength": 7,
    "analyticalThinking": 6,
    "creativeProblemSolving": 8,
    "consistency": 5,
    "stressResilience": 7
  },
  "predictedPerformance": {
    "nextExam": "Predicted score range (e.g., 75-85%)",
    "confidenceLevel": "High / Medium / Low",
    "riskAreas": ["Area 1 that needs attention"],
    "readinessScore": 72
  },
  "personalizedInsights": ["Insight 1 about their unique learning pattern", "Insight 2", "Insight 3"],
  "idealStudyStyle": "Description of the optimal study approach for THIS student",
  "weeklyOptimalSchedule": "Best daily study schedule based on their hours and patterns",
  "twinRecommendations": {
    "immediate": ["Do this today", "And this"],
    "thisWeek": ["Goal for this week"],
    "thisMonth": ["Longer term focus"]
  },
  "motivationalDNA": "What truly motivates this student based on their data",
  "growthTrajectory": "Where this student will be in 3 months if they follow recommendations",
  "parentReport": "2-sentence summary parents would understand"
}

All scores out of 10. Return ONLY valid JSON.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.6,
      maxOutputTokens: 2000,
    });

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse digital twin response');
    }

    // Save/Upsert Digital Twin in database if authenticated
    if (userId) {
      try {
        await (prisma as any).digitalTwin.upsert({
          where: { userId },
          update: {
            comprehensionVectors: parsed.cognitiveProfile as any,
            weaknesses: parsed.knowledgeMap?.weakSubjects || [],
            strengths: parsed.knowledgeMap?.strongSubjects || [],
          },
          create: {
            userId,
            comprehensionVectors: parsed.cognitiveProfile as any,
            weaknesses: parsed.knowledgeMap?.weakSubjects || [],
            strengths: parsed.knowledgeMap?.strongSubjects || [],
          },
        });
      } catch (dbErr) {
        log.error('Failed to save digital twin in DB', dbErr);
      }
    }

    return apiSuccess({
      ...parsed,
      generatedAt: Date.now(),
      dataPoints: studySessions.length + quizHistory.length,
    } as unknown as Record<string, unknown>);
  } catch (err) {
    log.error('Digital twin error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to build digital twin');
  }
}
