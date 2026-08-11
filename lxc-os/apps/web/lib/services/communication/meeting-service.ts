import { StreamClient } from "@stream-io/node-sdk";
import { prisma } from "../../prisma";
import { Role } from "@prisma/client";

const STREAM_API_KEY = process.env.STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET!;

let _client: StreamClient | null = null;

function getVideoClient(): StreamClient {
  if (!_client) {
    _client = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);
  }
  return _client;
}

export type MeetingType = "scheduled" | "instant";

export interface CreateMeetingInput {
  title: string;
  description?: string;
  startTime: Date;
  durationMinutes?: number;
  participantIds: string[];
  type?: MeetingType;
}

export class MeetingService {
  /**
   * Generate a Stream Video token for a user
   */
  static async getVideoToken(userId: string): Promise<{ token: string }> {
    const client = getVideoClient();
    const token = client.generateUserToken({ user_id: userId });
    return { token };
  }

  /**
   * Create a scheduled meeting – only Admin / Teacher can do this.
   */
  static async scheduleMeeting(
    creator: { id: string; role: string; schoolId?: string | null },
    input: CreateMeetingInput,
  ) {
    const allowedRoles: string[] = [Role.admin, Role.superadmin, Role.teacher];
    if (!allowedRoles.includes(creator.role)) {
      throw new Error("You do not have permission to schedule meetings");
    }

    const client = getVideoClient();
    const callId = `meeting_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const call = client.video.call("default", callId);

    // Upsert host + participants on Stream side
    const members = [
      { user_id: creator.id, role: "host" },
      ...input.participantIds.map((id) => ({ user_id: id, role: "member" })),
    ];

    await call.getOrCreate({
      data: {
        created_by_id: creator.id,
        members,
        custom: {
          title: input.title,
          description: input.description ?? "",
          schoolId: creator.schoolId ?? "",
        },
        starts_at: input.startTime,
      },
    });

    // Persist in DB
    const endTime = input.durationMinutes
      ? new Date(input.startTime.getTime() + input.durationMinutes * 60 * 1000)
      : undefined;

    const saved = await prisma.scheduledCall.create({
      data: {
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        endTime,
        creatorId: creator.id,
        joinToken: callId,
        isActive: false,
        participants: {
          createMany: {
            data: input.participantIds.map((pid) => ({
              participantId: pid,
              userId: pid,
            })),
          },
        },
      },
      include: { participants: true },
    });

    return {
      meeting: saved,
      callId,
      meetingLink: `${process.env.NEXT_PUBLIC_APP_URL || ""}/meet/${callId}`,
    };
  }

  /**
   * Start an instant meeting – returns a callId immediately.
   */
  static async startInstantMeeting(
    creator: { id: string; role: string; schoolId?: string | null },
    title: string,
  ) {
    const allowedRoles: string[] = [Role.admin, Role.superadmin, Role.teacher];
    if (!allowedRoles.includes(creator.role)) {
      throw new Error("You do not have permission to start instant meetings");
    }

    const client = getVideoClient();
    const callId = `instant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const call = client.video.call("default", callId);

    await call.getOrCreate({
      data: {
        created_by_id: creator.id,
        members: [{ user_id: creator.id, role: "host" }],
        custom: {
          title,
          type: "instant",
          schoolId: creator.schoolId ?? "",
        },
      },
    });

    const saved = await prisma.scheduledCall.create({
      data: {
        title,
        description: "Instant meeting",
        startTime: new Date(),
        creatorId: creator.id,
        joinToken: callId,
        isActive: true,
      },
    });

    return {
      meeting: saved,
      callId,
      meetingLink: `${process.env.NEXT_PUBLIC_APP_URL || ""}/meet/${callId}`,
    };
  }

  /**
   * List meetings for a user (as creator or participant)
   */
  static async listMeetings(userId: string, filter?: "upcoming" | "past") {
    const now = new Date();
    const where: any = {
      OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
    };

    if (filter === "upcoming") {
      where.startTime = { gte: now };
    } else if (filter === "past") {
      where.startTime = { lt: now };
    }

    return prisma.scheduledCall.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, profilePic: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, profilePic: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });
  }

  /**
   * Get a single meeting and validate the user has access
   */
  static async getMeeting(callId: string, userId: string) {
    const meeting = await prisma.scheduledCall.findFirst({
      where: {
        joinToken: callId,
        OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
      },
      include: {
        creator: { select: { id: true, name: true, profilePic: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, profilePic: true } },
          },
        },
      },
    });

    if (!meeting) throw new Error("Meeting not found or access denied");
    return meeting;
  }

  /**
   * End a meeting (host only)
   */
  static async endMeeting(callId: string, userId: string) {
    const meeting = await prisma.scheduledCall.findFirst({
      where: { joinToken: callId, creatorId: userId },
    });
    if (!meeting) throw new Error("Meeting not found or not the creator");

    await prisma.scheduledCall.update({
      where: { id: meeting.id },
      data: { isEnded: true, isActive: false },
    });

    return { success: true };
  }

  /**
   * Add participant to an existing meeting (admin/teacher only)
   */
  static async addParticipant(
    callId: string,
    requesterId: string,
    participantId: string,
  ) {
    const meeting = await prisma.scheduledCall.findFirst({
      where: { joinToken: callId, creatorId: requesterId },
    });
    if (!meeting) throw new Error("Meeting not found or access denied");

    // Check not already a participant
    const exists = await prisma.scheduledCallParticipant.findFirst({
      where: { callId: meeting.id, userId: participantId },
    });
    if (exists) return { message: "Already a participant" };

    await prisma.scheduledCallParticipant.create({
      data: {
        callId: meeting.id,
        participantId,
        userId: participantId,
      },
    });

    const client = getVideoClient();
    const call = client.video.call("default", callId);
    await call.updateCallMembers({
      update_members: [{ user_id: participantId, role: "member" }],
    });

    return { success: true };
  }
}
