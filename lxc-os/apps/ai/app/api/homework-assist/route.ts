/**
 * AI Homework Assistant API
 *
 * Provides:
 * - Step-by-step explanations
 * - Multi-language support (Hindi / Hinglish / English)
 * - Simplified vs advanced explanation modes
 */

import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createLogger } from '@/lib/logger';
import { apiError } from '@/lib/server/api-response';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';

const log = createLogger('HomeworkAssist');

export interface HomeworkAssistRequest {
  question: string;
  subject?: string;
  level?: 'simplified' | 'advanced';
  language?: 'hindi' | 'hinglish' | 'english';
  context?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as HomeworkAssistRequest;
    const { question, subject, level = 'simplified', language = 'hindi', context } = body;

    if (!question?.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'question is required');
    }

    const { model: languageModel } = resolveModelFromHeaders(req);

    const langInstructions: Record<string, string> = {
      hindi: 'हिंदी में उत्तर दें। सभी व्याख्याएं और उदाहरण हिंदी में दें।',
      hinglish:
        'Hinglish mein answer do — Hindi aur English mix karke, jo zyada samajh mein aaye. Example: "Pehle hum equation solve karenge, toh..."',
      english: 'Answer in clear, simple English.',
    };

    const levelInstructions: Record<string, string> = {
      simplified:
        language === 'english'
          ? 'Use very simple language, short sentences, real-life examples. Imagine explaining to a 10-year-old. Avoid jargon.'
          : language === 'hinglish'
            ? 'Bilkul simple bhasha use karo, jaise ek 10 saal ke bachche ko samjha rahe ho. Real life ke examples do.'
            : 'बहुत सरल भाषा का उपयोग करें जैसे 10 साल के बच्चे को समझा रहे हों। वास्तविक जीवन के उदाहरण दें।',
      advanced:
        language === 'english'
          ? 'Use precise academic language. Include underlying theory, edge cases, and connections to advanced concepts. Suitable for high school or college level.'
          : language === 'hinglish'
            ? 'Academic level explanation do. Theory, exceptions aur advanced concepts ke connections batao. High school/college level ke liye.'
            : 'सटीक शैक्षणिक भाषा का उपयोग करें। अंतर्निहित सिद्धांत, विशेष मामले और उन्नत अवधारणाओं से संबंध बताएं।',
    };

    const systemPrompt = `You are an expert AI homework assistant.
${langInstructions[language] ?? langInstructions.hindi}

Explanation level: ${levelInstructions[level] ?? levelInstructions.simplified}

Your response structure:
1. Brief direct answer (1-2 sentences)
2. Step-by-step explanation (numbered steps)
3. Example or analogy (make it relatable)
4. Key takeaway or formula (if applicable)
5. Practice tip (one quick suggestion to reinforce learning)

${subject ? `Subject context: ${subject}` : ''}
${context ? `Additional context: ${context}` : ''}

Be warm, encouraging, and make the student feel confident they can understand the topic.`;

    const userPrompt = question;

    const result = streamText({
      model: languageModel,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    log.error('Error:', error);
    return apiError('INTERNAL_ERROR', 500, 'Failed to process homework request');
  }
}
