/**
 * Module 11 — AI Communication Coach
 * Analyzes student writing/speech samples, gives English confidence building,
 * public speaking tips, interview prep, debate support
 */

import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError } from '@/lib/server/api-response';

const log = createLogger('CommunicationCoach');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, content, topic = '', language = 'hindi' } = body;

    if (!mode || !content) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Mode and content are required');
    }

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'Give feedback in Hindi.'
        : language === 'hinglish'
          ? 'Give feedback in Hinglish.'
          : 'Give feedback in English.';

    const prompts: Record<string, string> = {
      essay: `You are an expert English and Hindi writing coach for Indian students.

${langInstruction}

Analyze this student's writing and give detailed feedback:
---
${content}
---

Provide feedback covering:
1. **Overall Score**: X/10 with one-line summary
2. **Grammar & Language**: Specific errors found and corrections
3. **Vocabulary**: Suggest 5 better words they could have used
4. **Structure & Flow**: Is the essay well-organized?
5. **Ideas & Content**: Is the argument clear?
6. **Improved Version**: Rewrite their weakest paragraph
7. **3 Key Tips**: Most important improvements for next time
8. **Encouragement**: End with genuine motivation

Be specific, kind but honest. Indian students often struggle with articles (a/an/the) and tense consistency — check these.`,

      speech: `You are a public speaking coach helping Indian students build confidence.

${langInstruction}

The student wants to give a speech on: "${topic}"
Their draft/notes:
---
${content}
---

Give coaching feedback on:
1. **Opening Hook**: How to grab attention in 10 seconds
2. **Structure**: Introduction → Body → Conclusion framework
3. **Language Tips**: Simple words that land well
4. **Body Language Tips**: 3 specific gestures/posture tips
5. **Confidence Builders**: How to overcome stage fright (India-specific fears)
6. **Revised Opening**: Write a better opening line for them
7. **Closing Statement**: Write a powerful ending
8. **Practice Plan**: How to practice this speech in 3 days`,

      interview: `You are an interview preparation coach for Indian students (school/college/job interviews).

${langInstruction}

The student is preparing for: "${topic || 'a school/college interview'}"
Their answer draft:
---
${content}
---

Coach them on:
1. **Answer Quality**: Is this a strong answer? Score it 1-10
2. **STAR Method**: Teach them Situation-Task-Action-Result format
3. **Improved Answer**: Write a polished version of their answer
4. **Common Mistakes**: What Indian students typically do wrong in interviews
5. **Body Language**: Eye contact, posture, tone tips
6. **Hindi vs English**: When to use which language
7. **5 Questions to Prepare**: Most likely follow-up questions
8. **One Liner**: Their best self-introduction sentence`,

      debate: `You are a debate coach helping Indian students argue effectively.

${langInstruction}

Debate topic: "${topic}"
Student's argument:
---
${content}
---

Coach them on:
1. **Argument Strength**: Rate 1-10 and explain
2. **Logical Gaps**: Where is the argument weak?
3. **Evidence Needed**: What facts/data would strengthen this
4. **Counter-Arguments**: The 3 strongest points the opposition will make
5. **Rebuttals**: How to respond to each counter-argument
6. **Opening Statement**: Write a powerful 30-second opener
7. **Rhetorical Devices**: Teach them 2-3 debate techniques
8. **Indian Context**: Add relevant Indian examples/statistics`,
    };

    const systemPrompt = prompts[mode] || prompts.essay;

    const result = streamText({
      model,
      prompt: systemPrompt,
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    log.error('Communication coach error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to generate coaching feedback');
  }
}
