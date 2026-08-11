/**
 * Module 16 — AI Soft Skills Coach
 * Rates communication rate, pitch modulation, and leadership scores, then saves to SoftSkillsScore.
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('SoftSkillsRate');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return apiError('INVALID_REQUEST' as any, 401, 'Student must be authenticated');
    }

    const body = await req.json();
    const { speechText } = body;

    if (!speechText) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Speech text is required');
    }

    const { model } = resolveModelFromHeaders(req);

    const prompt = `You are an expert AI soft skills and communication coach.
Analyze the following speech transcript for pacing, structural clarity, leadership tone, and modulation variety:
"${speechText}"

Respond with an evaluation score out of 100 in JSON format:
{
  "communicationRate": 82.5,
  "pitchModulation": 76.0,
  "leadershipScore": 84.0,
  "feedback": "Your speaking rate is well-pacing. Work on modulation by adding pauses before important keywords."
}
Return ONLY valid JSON.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 600,
    });

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse AI coaching response');
    }

    const newScore = await (prisma as any).softSkillsScore.create({
      data: {
        userId,
        communicationRate: parsed.communicationRate || 75.0,
        pitchModulation: parsed.pitchModulation || 75.0,
        leadershipScore: parsed.leadershipScore || 75.0,
      },
    });

    return apiSuccess({
      score: newScore,
      feedback: parsed.feedback,
    });
  } catch (err) {
    log.error('Soft skills rating error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to rate soft skills');
  }
}
