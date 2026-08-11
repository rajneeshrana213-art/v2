/**
 * Module 5 — Adaptive Difficulty Engine
 * Generates quiz questions calibrated to student's current performance level
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';

const log = createLogger('AdaptiveQuiz');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subject,
      topic,
      studentClass,
      recentScores = [],
      language = 'hindi',
      questionCount = 5,
    } = body;

    if (!subject || !topic) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Subject and topic are required');
    }

    const { model } = resolveModelFromHeaders(req);

    // Determine difficulty from recent performance
    const avgScore =
      recentScores.length > 0
        ? recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length
        : 50;

    let difficulty: string;
    let difficultyHi: string;
    if (avgScore >= 80) {
      difficulty = 'advanced';
      difficultyHi = 'उन्नत';
    } else if (avgScore >= 55) {
      difficulty = 'intermediate';
      difficultyHi = 'मध्यम';
    } else {
      difficulty = 'basic';
      difficultyHi = 'आसान';
    }

    const langInstruction =
      language === 'hindi'
        ? 'All questions and options must be in Hindi.'
        : language === 'hinglish'
          ? 'Use Hinglish — mix Hindi and English naturally in questions and options.'
          : 'Use clear, simple English.';

    const prompt = `You are an expert Indian education AI creating adaptive quiz questions.

Subject: ${subject}
Topic: ${topic}
Class: ${studentClass || '10'}
Difficulty level: ${difficulty} (${difficultyHi}) — based on student average score of ${Math.round(avgScore)}%
Number of questions: ${questionCount}
${langInstruction}

Generate ${questionCount} multiple-choice questions at ${difficulty} level. Return JSON:
{
  "subject": "${subject}",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "difficultyHi": "${difficultyHi}",
  "adaptiveNote": "Brief explanation of why this difficulty was chosen",
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct (2–3 sentences)",
      "concept": "Core concept being tested",
      "marks": 2
    }
  ],
  "totalMarks": ${questionCount * 2},
  "nextDifficultyHint": "If student scores above X, switch to Y difficulty"
}

Rules:
- ${difficulty === 'basic' ? 'Focus on fundamental concepts, direct questions, clear options' : difficulty === 'intermediate' ? 'Mix application and conceptual questions' : "Include analysis, synthesis, evaluation-level questions (Bloom's taxonomy)"}
- Make incorrect options plausible (not obviously wrong)
- Explanation should help student learn the correct concept
Return ONLY valid JSON.`;

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
      return apiError('PARSE_FAILED', 500, 'Failed to parse quiz response');
    }

    return apiSuccess({ ...parsed, avgScore: Math.round(avgScore) } as unknown as Record<
      string,
      unknown
    >);
  } catch (err) {
    log.error('Adaptive quiz error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to generate adaptive quiz');
  }
}
