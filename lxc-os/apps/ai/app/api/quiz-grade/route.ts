/**
 * Quiz Grading API
 *
 * POST: Receives a text question + user answer, calls LLM for scoring and feedback.
 * Used for short-answer (text) questions that cannot be graded locally.
 */

import { NextRequest } from 'next/server';
import { callLLM } from '@/lib/ai/llm';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
const log = createLogger('Quiz Grade');

interface GradeRequest {
  question: string;
  userAnswer: string;
  points: number;
  commentPrompt?: string;
  language?: string;
}

interface GradeResponse {
  score: number;
  comment: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GradeRequest;
    const { question, userAnswer, points, commentPrompt, language } = body;

    if (!question || !userAnswer) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'question and userAnswer are required');
    }

    // Resolve model from request headers
    const { model: languageModel } = resolveModelFromHeaders(req);

    const isHi = language === 'hi-IN';

    const systemPrompt = isHi
      ? `आप एक पेशेवर शैक्षिक मूल्यांकनकर्ता हैं। प्रश्न और छात्र के उत्तर के आधार पर अंक दें और संक्षिप्त प्रतिक्रिया दें।
केवल निम्नलिखित JSON प्रारूप में उत्तर दें (कोई अन्य सामग्री नहीं):
{"score": <0 से ${points} तक का पूर्णांक>, "comment": "<एक-दो वाक्य की प्रतिक्रिया>"}`
      : `You are a professional educational assessor. Grade the student's answer and provide brief feedback.
You must reply in the following JSON format only (no other content):
{"score": <integer from 0 to ${points}>, "comment": "<one or two sentences of feedback>"}`;

    const userPrompt = isHi
      ? `प्रश्न: ${question}
पूर्ण अंक: ${points}
${commentPrompt ? `मूल्यांकन मार्गदर्शन: ${commentPrompt}\n` : ''}छात्र का उत्तर: ${userAnswer}`
      : `Question: ${question}
Full marks: ${points} points
${commentPrompt ? `Grading guidance: ${commentPrompt}\n` : ''}Student answer: ${userAnswer}`;

    const result = await callLLM(
      {
        model: languageModel,
        system: systemPrompt,
        prompt: userPrompt,
      },
      'quiz-grade',
    );

    // Parse the LLM response as JSON
    const text = result.text.trim();
    let gradeResult: GradeResponse;

    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      const parsed = JSON.parse(jsonMatch[0]);
      gradeResult = {
        score: Math.max(0, Math.min(points, Math.round(Number(parsed.score)))),
        comment: String(parsed.comment || ''),
      };
    } catch {
      // Fallback: give partial credit with a generic comment
      gradeResult = {
        score: Math.round(points * 0.5),
        comment: isHi
          ? 'उत्तर प्राप्त हुआ। कृपया मानक उत्तर देखें।'
          : 'Answer received. Please refer to the standard answer.',
      };
    }

    return apiSuccess({ ...gradeResult });
  } catch (error) {
    log.error('Error:', error);
    return apiError('INTERNAL_ERROR', 500, 'Failed to grade answer');
  }
}
