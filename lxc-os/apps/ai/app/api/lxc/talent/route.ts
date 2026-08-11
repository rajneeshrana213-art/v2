/**
 * Module 21 — Talent Incubator Mode
 * Discovers hidden talents, olympiad pathways, startup ideas,
 * creative fields, sports — goes beyond academics to find unique strengths
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';

const log = createLogger('TalentIncubator');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      interests,
      hobbies,
      achievements,
      studentClass = 'Class 10',
      strengths,
      language = 'hindi',
    } = body;

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'Respond entirely in Hindi.'
        : language === 'hinglish'
          ? 'Respond in Hinglish.'
          : 'Respond in English.';

    const prompt = `You are a talent scout and incubator for exceptional Indian students. Your job is to find hidden potential that standard education misses.

${langInstruction}

Student (${studentClass}) Profile:
- Interests: ${interests || 'Not specified'}
- Hobbies: ${hobbies || 'Not specified'}
- Achievements so far: ${achievements || 'None mentioned'}
- Self-described strengths: ${strengths || 'Not specified'}

Discover their unique talent pathway and return as JSON:
{
  "talentProfile": {
    "primaryTalent": "The standout talent area discovered",
    "talentType": "Academic / Creative / Athletic / Technical / Social / Entrepreneurial / Artistic",
    "rarityScore": 8,
    "potentialLevel": "Exceptional / High / Strong / Developing",
    "uniqueStrengthStatement": "A personalized strength statement for this student"
  },
  "pathways": [
    {
      "path": "Pathway name (e.g., Mathematics Olympiad)",
      "type": "Academic / Creative / Startup / Sports / Arts / Social",
      "description": "What this pathway involves",
      "indiaOpportunities": ["Competition 1", "Program 2", "Scholarship 3"],
      "firstStep": "The very first thing to do this week",
      "timeToResults": "When they'll see results",
      "successStories": "A real Indian who went this path"
    }
  ],
  "hiddenTalents": ["Unexpected talent 1 they might not know they have", "Hidden talent 2"],
  "olympiadOpportunities": [
    {
      "name": "Olympiad/Competition name",
      "subject": "Subject area",
      "eligibility": "Class X-XII",
      "registrationMonth": "Month to register",
      "website": "organising body"
    }
  ],
  "startupIdeas": [
    {
      "idea": "A startup idea suited to their interests",
      "problem": "Indian problem it solves",
      "feasibility": "High / Medium / Low for a student",
      "firstAction": "How to start while still in school"
    }
  ],
  "skillsToAcquire": [
    {
      "skill": "Skill name",
      "why": "Why this unlocks their potential",
      "freeResource": "Free Indian resource to learn it (YouTube/NPTEL/etc)"
    }
  ],
  "mentorProfile": "Description of the ideal mentor type for this student",
  "threeyearVision": "Where this student could realistically be in 3 years if they pursue their talent",
  "parentPitch": "How to convince Indian parents to support this non-traditional path",
  "immediateWins": ["Small achievement they can accomplish in 30 days", "Win 2", "Win 3"]
}

Be bold and specific. Discover talent they haven't seen in themselves. Return ONLY valid JSON.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.8,
      maxOutputTokens: 2200,
    });

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse talent response');
    }

    return apiSuccess(parsed as unknown as Record<string, unknown>);
  } catch (err) {
    log.error('Talent incubator error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to discover talent profile');
  }
}
