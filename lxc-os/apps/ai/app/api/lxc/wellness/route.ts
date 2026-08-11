/**
 * Module 15 — Emotional Intelligence & Mental Wellness AI
 * Mood check-in, stress detection, mindfulness, peer pressure, exam anxiety,
 * crisis support with helpline referrals
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('WellnessAI');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { mood, moodScore, stressors = [], freeText = '', language = 'english' } = body;

    if (!mood) {
      return apiError('MISSING_MOOD', 400, 'Mood check-in data required');
    }

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'Respond with warmth and care entirely in Hindi.'
        : language === 'hinglish'
          ? 'Respond warmly in Hinglish (Hindi + English mix).'
          : 'Respond warmly in English.';

    const isCrisis =
      freeText.toLowerCase().includes('suicide') ||
      freeText.toLowerCase().includes('hurt myself') ||
      freeText.toLowerCase().includes('end it') ||
      moodScore <= 2;

    const crisisNote = isCrisis
      ? `
IMPORTANT: This student may be in distress. Begin your response by immediately providing:
1. Validation of their feelings
2. iCall helpline: 9152987821 (India)
3. Vandrevala Foundation: 1860-2662-345 (24/7)
4. Tell them it's okay to talk to a trusted adult
Then continue with the wellness support below.
`
      : '';

    const prompt = `You are a compassionate mental wellness companion for Indian students. You are NOT a therapist, but a caring friend who listens and suggests healthy coping strategies.

${crisisNote}

Student's mood: ${mood}
Mood score: ${moodScore}/10
Stressors they mentioned: ${stressors.join(', ') || 'none specified'}
What they shared: "${freeText || 'Nothing additional'}"

${langInstruction}

Respond with genuine empathy and provide a wellness support response as JSON:
{
  "greeting": "Warm, personalized acknowledgment of how they're feeling (2-3 sentences)",
  "emotionValidation": "Validate their specific emotion without judgment",
  "wellnessScore": ${moodScore},
  "wellnessStatus": "Great / Good / Okay / Struggling / Need Support",
  "primaryEmotion": "The dominant emotion detected",
  "rootCause": "Possible root cause based on stressors (be insightful but gentle)",
  "immediateExercise": {
    "name": "Exercise name (e.g., 4-7-8 Breathing, 5-4-3-2-1 Grounding)",
    "duration": "X minutes",
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
    "why": "Why this helps right now"
  },
  "copingStrategies": ["Strategy 1 for their specific stressor", "Strategy 2", "Strategy 3"],
  "affirmation": "A powerful, personalized affirmation in the student's language",
  "journalPrompt": "A reflective journal prompt for tonight",
  "sleepTip": "One specific sleep hygiene tip relevant to their situation",
  "tomorrowPlan": "One small positive action to take tomorrow",
  "indianContext": "Acknowledge any specific Indian pressure (board exams, parental expectations, etc.) if mentioned",
  ${isCrisis ? '"crisisResources": {"iCall": "9152987821", "vandrevala": "1860-2662-345", "snehaMumbai": "044-24640050", "message": "You are not alone. Professional support is available 24/7."},' : ''}
  "closingMessage": "Warm closing that leaves them feeling supported"
}

Return ONLY valid JSON. Be genuinely empathetic, not clinical.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1800,
    });

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse wellness response');
    }

    // Save WellnessLog to database if authenticated
    if (userId) {
      try {
        const anxietyIndex = Math.max(0, 10 - moodScore);
        const burnoutIndex = Math.min(10, stressors.length * 2);

        await (prisma as any).wellnessLog.create({
          data: {
            userId,
            burnoutIndex,
            anxietyIndex,
            sentimentLog: freeText,
          },
        });
      } catch (dbErr) {
        log.error('Failed to log wellness in DB', dbErr);
      }
    }

    return apiSuccess({
      ...parsed,
      isCrisis,
    } as unknown as Record<string, unknown>);
  } catch (err) {
    log.error('Wellness AI error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to process wellness check-in');
  }
}
