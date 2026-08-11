/**
 * Module 21 — Offline Mode Synchronization Buffer
 * Receives and commits batch transaction payloads synchronized from localStorages
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('OfflineSync');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { batch = [] } = body; // Array of offline buffer elements

    const syncedResults = [];

    if (userId && batch.length > 0) {
      for (const item of batch) {
        // Enforce strict incremental payload sync constraint (<5KB per chunk)
        const itemSize = Buffer.byteLength(JSON.stringify(item));
        if (itemSize > 5120) {
          log.warn(`Skipping batch item: payload size ${itemSize} bytes exceeds 5KB 2G network limit`);
          continue;
        }

        try {
          const record = await (prisma as any).offlineSyncBuffer.create({
            data: {
              userId,
              tableName: item.tableName || 'General',
              payload: item.payload as any,
              operation: item.operation || 'INSERT',
              synced: true,
            },
          });
          syncedResults.push(record.id);
        } catch (dbErr) {
          log.error('Failed to commit offline buffer item', dbErr);
        }
      }
    }

    return apiSuccess({
      syncedCount: syncedResults.length,
      status: 'Sync batches processed successfully',
    });
  } catch (err) {
    log.error('Offline sync error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to process offline sync');
  }
}
