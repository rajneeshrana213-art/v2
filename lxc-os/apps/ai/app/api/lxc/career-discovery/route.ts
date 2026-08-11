/**
 * Module 9 — Career Discovery Engine
 * Analyzes student interests + personality → suggests top career paths
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('CareerDiscovery');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { answers, studentClass, subjects, language = 'hindi' } = body;

    if (!answers || typeof answers !== 'object') {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Quiz answers are required');
    }

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'Respond entirely in Hindi (Devanagari script).'
        : language === 'hinglish'
          ? 'Respond in Hinglish (mix of Hindi and English).'
          : 'Respond in clear English.';

    const answersText = Object.entries(answers)
      .map(([q, a]) => `Q: ${q}\nA: ${a}`)
      .join('\n\n');

    const prompt = `You are an expert Indian career counselor helping a Class ${studentClass || '10'} student discover their ideal career path.

Student's quiz answers:
${answersText}

Current subjects: ${Array.isArray(subjects) ? subjects.join(', ') : 'Not specified'}

${langInstruction}

Analyze the student's interests, strengths, and personality from their answers. Return a JSON career profile:
{
  "personalityType": "Creative/Analytical/Social/Practical/Leadership/Scientific",
  "personalityDescription": "2-3 sentence description of the student's personality",
  "topCareers": [
    {
      "title": "Career name (in local language)",
      "titleEn": "Career name in English",
      "icon": "Single emoji",
      "match": 95,
      "description": "Why this career suits them (2–3 sentences)",
      "requiredSubjects": ["Math", "Physics"],
      "entryPath": "How to enter — JEE/NEET/Arts/Commerce etc",
      "timeToCareer": "Years from Class 10",
      "incomeRange": "Expected salary range in India (in rupees)",
      "opportunities": ["Opportunity 1", "Opportunity 2"],
      "indianContext": "Specific opportunity in India/Bharat"
    }
  ],
  "skillsToGrow": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "actionPlan": {
    "immediate": "What to do right now (this month)",
    "shortTerm": "6 months action plan",
    "longTerm": "2–3 year plan"
  },
  "encouragementMessage": "Warm, motivating message addressing the student directly",
  "alternateOptions": ["Alternative career 1", "Alternative career 2"]
}

Rules:
- Suggest EXACTLY 5 careers ranked by match percentage
- Focus on careers realistic for Indian students (government, private, business, arts)
- Include both traditional and emerging careers
- Be encouraging and realistic
- All descriptive text must follow the language instruction
Return ONLY valid JSON.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 2500,
    });

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse AI career response');
    }

    // Save Top Careers into Database if user is authenticated
    if (userId) {
      try {
        // Clean up previous career recommendations to avoid duplicate records
        await (prisma as any).careerRecommendation.deleteMany({
          where: { userId },
        });

        for (const career of parsed.topCareers || []) {
          await (prisma as any).careerRecommendation.create({
            data: {
              userId,
              careerPath: career.titleEn || career.title,
              fitScore: parseFloat(career.match || '85'),
              unlocked: true,
            },
          });
        }
      } catch (dbErr) {
        log.error('Failed to save career recommendations in DB', dbErr);
      }
    }

    return apiSuccess(parsed as unknown as Record<string, unknown>);
  } catch (err) {
    log.error('Career discovery error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to generate career profile');
  }
}
