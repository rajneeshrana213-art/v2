/**
 * Module 2 — Smart Notes Engine
 * Converts lecture notes/PDFs to summaries & concept map node vectors
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('SmartNotes');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { title = 'Note Summary', content, sourceUrl = null } = body;

    if (!content || !content.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Content is required');
    }

    const { model } = resolveModelFromHeaders(req);

    const prompt = `You are an expert AI learning scientist. Convert this lecture/note content into a concise summary and a structured concept map.

Content:
${content}

Return ONLY valid JSON in this format:
{
  "summary": "Clear, markdown-formatted structured notes summary containing key sections, definitions, and takeaways.",
  "conceptMap": {
    "nodes": [
      { "id": "node1", "label": "Key Term/Concept", "x": 100, "y": 150 },
      { "id": "node2", "label": "Related Term", "x": 200, "y": 250 }
    ],
    "edges": [
      { "from": "node1", "to": "node2", "label": "relationship explanation" }
    ]
  }
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.5,
      maxOutputTokens: 2000,
    });

    let parsed;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result.text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse AI summaries');
    }

    // Save notes in database if authenticated
    let savedNote = null;
    if (userId) {
      savedNote = await (prisma as any).smartNotes.create({
        data: {
          userId,
          sourceUrl,
          summary: parsed.summary,
          conceptMap: parsed.conceptMap as any,
        },
      });
    }

    return apiSuccess({
      note: savedNote,
      summary: parsed.summary,
      conceptMap: parsed.conceptMap,
    });
  } catch (err) {
    log.error('Smart notes error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to process smart notes');
  }
}
