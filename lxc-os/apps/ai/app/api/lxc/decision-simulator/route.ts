/**
 * Module 10 — Decision Simulator
 * Compare two life paths (career options, stream choices, college decisions)
 * Uses multi-dimensional analysis: financial, lifestyle, difficulty, India-specific context
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('DecisionSimulator');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { optionA, optionB, context = '', studentClass = 'Class 10', language = 'hindi' } = body;

    if (!optionA || !optionB) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Two options required for comparison');
    }

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'Respond entirely in Hindi.'
        : language === 'hinglish'
          ? 'Respond in Hinglish (Hindi + English mix).'
          : 'Respond in English.';

    const prompt = `You are a trusted life advisor for Indian students, helping them make big decisions.

Student is in ${studentClass}.
Decision to make: "${optionA}" vs "${optionB}"
Additional context: ${context || 'None provided'}

${langInstruction}

Analyze both options deeply with Indian context and provide a JSON response:
{
  "summary": "One sentence capturing the core trade-off",
  "optionA": {
    "name": "${optionA}",
    "verdict": "Good / Risky / Excellent / Challenging",
    "verdictEmoji": "✅ or ⚠️ or 🌟 or 💪",
    "pros": ["Pro 1", "Pro 2", "Pro 3", "Pro 4"],
    "cons": ["Con 1", "Con 2", "Con 3"],
    "averageIncome": "₹X - ₹Y LPA range in India",
    "difficultyScore": 7,
    "stabilityScore": 8,
    "growthScore": 9,
    "timeToSuccess": "X years typically",
    "realExample": "A real Indian success story or statistic",
    "bestFor": "Type of student this suits"
  },
  "optionB": {
    "name": "${optionB}",
    "verdict": "Good / Risky / Excellent / Challenging",
    "verdictEmoji": "✅ or ⚠️ or 🌟 or 💪",
    "pros": ["Pro 1", "Pro 2", "Pro 3", "Pro 4"],
    "cons": ["Con 1", "Con 2", "Con 3"],
    "averageIncome": "₹X - ₹Y LPA range in India",
    "difficultyScore": 6,
    "stabilityScore": 7,
    "growthScore": 8,
    "timeToSuccess": "X years typically",
    "realExample": "A real Indian success story or statistic",
    "bestFor": "Type of student this suits"
  },
  "recommendation": "Balanced recommendation considering both options",
  "hybridPath": "A creative third path combining both options if possible",
  "keyQuestion": "The most important question the student should ask themselves before deciding",
  "parentTalk": "How to explain this decision to Indian parents",
  "nextSteps": ["Step 1 to take this week", "Step 2", "Step 3"]
}

Scores are out of 10. Be honest, not just positive. Return ONLY valid JSON.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse decision response');
    }

    // Save simulation log in DB if authenticated
    if (userId) {
      try {
        const difficultyA = parsed.optionA?.difficultyScore || 5;
        const difficultyB = parsed.optionB?.difficultyScore || 5;
        const successProbability = Math.max(0.1, Math.min(0.99, 1 - (difficultyA + difficultyB) / 20));

        await (prisma as any).decisionSimulations.create({
          data: {
            userId,
            targetCareer: optionA,
            simulatedPaths: parsed,
            successProbability,
          },
        });
      } catch (dbErr) {
        log.error('Failed to save decision simulation in DB', dbErr);
      }
    }

    return apiSuccess(parsed as unknown as Record<string, unknown>);
  } catch (err) {
    log.error('Decision simulator error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to run decision simulation');
  }
}
