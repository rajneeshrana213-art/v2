/**
 * Module 6 — Flashcard AI review engine
 * Custom SuperMemo-2 Spaced Repetition scheduler
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('FlashcardAI');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { cardId, grade } = body; // grade: 0 (forgot) to 3 (easy)

    if (!cardId || grade === undefined) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'CardId and grade are required');
    }

    let nextReview = new Date();
    let savedCard = null;

    if (userId) {
      const card = await (prisma as any).flashcardAI.findUnique({ where: { id: cardId } });
      if (card) {
        let interval = card.interval;
        let easeFactor = card.easeFactor;
        let repetitions = card.repetitions;

        if (grade >= 2) {
          if (repetitions === 0) {
            interval = 1;
          } else if (repetitions === 1) {
            interval = 6;
          } else {
            interval = Math.round(interval * easeFactor);
          }
          repetitions++;
          easeFactor = easeFactor + (0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02));
        } else {
          repetitions = 0;
          interval = 1;
          easeFactor = Math.max(1.3, easeFactor - 0.2);
        }

        nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

        savedCard = await (prisma as any).flashcardAI.update({
          where: { id: cardId },
          data: {
            interval,
            easeFactor,
            repetitions,
            nextReview,
          },
        });
      }
    }

    return apiSuccess({
      card: savedCard,
      nextReview,
    });
  } catch (err) {
    log.error('Flashcard review error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to process card review');
  }
}
