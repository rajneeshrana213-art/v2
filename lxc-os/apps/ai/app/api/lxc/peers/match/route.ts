/**
 * Module 19 — Peer Network & Study Battles
 * Matches active students to study circles or battle arenas.
 */

import { NextRequest } from 'next/server';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('PeersMatch');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || 'anonymous-user';

    const body = await req.json();
    const { groupName = 'Bharat Study Circle' } = body;

    let group = await (prisma as any).peerStudyGroup.findFirst({
      where: { name: groupName },
    });

    if (group) {
      if (!group.members.includes(userId)) {
        group = await (prisma as any).peerStudyGroup.update({
          where: { id: group.id },
          data: {
            members: {
              set: [...group.members, userId],
            },
          },
        });
      }
    } else {
      group = await (prisma as any).peerStudyGroup.create({
        data: {
          name: groupName,
          members: [userId],
          activeBattles: 1,
        },
      });
    }

    return apiSuccess({
      success: true,
      group,
      message: `Successfully matched with study group ${group.name}!`,
    });
  } catch (err) {
    log.error('Peers match error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to match peer study groups');
  }
}
