import { prisma } from "@/lib/prisma";
import { DoubtStatus, DoubtPriority, Role } from "@prisma/client";

// Coin reward constants
export const COIN_REWARDS = {
  ANSWER_POSTED: 5,
  ANSWER_ACCEPTED: 20,
};

export const createDoubtService = async (data: {
  title: string;
  content: string;
  classId: string;
  subjectId: string;
  userId: string;
  chapter?: string;
  difficulty?: string;
  priority?: DoubtPriority;
  attachmentUrl?: string;
}) => {
  return await prisma.doubt.create({
    data: {
      title: data.title,
      content: data.content,
      classId: data.classId,
      subjectId: data.subjectId,
      userId: data.userId,
      chapter: data.chapter,
      difficulty: data.difficulty,
      priority: data.priority || DoubtPriority.LOW,
      attachmentUrl: data.attachmentUrl,
    },
  });
};

export const getDoubtsService = async (filters: {
  classId?: string;
  subjectId?: string;
  status?: DoubtStatus | "ACTIVE";
  userId?: string;
  schoolId?: string;
}) => {
  const schoolId = filters.schoolId;
  const classId =
    filters.classId && filters.classId !== "undefined"
      ? filters.classId
      : undefined;
  const subjectId =
    filters.subjectId && filters.subjectId !== "undefined"
      ? filters.subjectId
      : undefined;

  let statusFilter: any = undefined;
  if (filters.status === "ACTIVE") {
    statusFilter = { not: DoubtStatus.CLOSED };
  } else if (filters.status && (filters.status as string) !== "undefined") {
    statusFilter = filters.status;
  }

  return await prisma.doubt.findMany({
    where: {
      // Always scope by school (via class relation) when schoolId is provided
      ...(schoolId && {
        class: {
          schoolId,
          ...(classId && { id: classId }),
        },
      }),
      // If no schoolId, fall back to direct classId filter
      ...(!schoolId && classId && { classId }),
      ...(subjectId && { subjectId }),
      ...(statusFilter && { status: statusFilter }),
      ...(filters.userId && { userId: filters.userId }),
    },
    include: {
      user: {
        select: {
          name: true,
          profilePic: true,
        },
      },
      subject: true,
      _count: {
        select: { replies: true },
      },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
};

export const getPublicDoubtsService = async (filters: {
  subjectId?: string;
  status?: DoubtStatus | "ACTIVE";
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const subjectId =
    filters.subjectId && filters.subjectId !== "undefined"
      ? filters.subjectId
      : undefined;

  let statusFilter: any = undefined;
  if (filters.status === "ACTIVE") {
    statusFilter = { not: DoubtStatus.CLOSED };
  } else if (filters.status && (filters.status as string) !== "undefined") {
    statusFilter = filters.status;
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = {
    ...(subjectId && { subjectId }),
    ...(statusFilter && { status: statusFilter }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
      ],
    }),
  };

  const [doubts, total] = await Promise.all([
    prisma.doubt.findMany({
      where,
      include: {
        user: { select: { name: true, profilePic: true } },
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.doubt.count({ where }),
  ]);

  return {
    data: doubts,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getDoubtByIdService = async (id: string) => {
  return await prisma.doubt.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          profilePic: true,
        },
      },
      subject: true,
      replies: {
        include: {
          user: {
            select: {
              name: true,
              profilePic: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

export const createDoubtReplyService = async (data: {
  doubtId: string;
  userId: string;
  role: Role;
  content: string;
  attachmentUrl?: string;
}) => {
  const reply = await prisma.doubtReply.create({
    data,
  });

  // Award coins for posting an answer
  await awardCoinsService(data.userId, COIN_REWARDS.ANSWER_POSTED, "Answer posted");

  // If a teacher replies, automatically mark as ANSWERED if it was OPEN
  if (
    data.role === Role.teacher ||
    data.role === Role.admin ||
    data.role === Role.superadmin
  ) {
    await prisma.doubt.update({
      where: { id: data.doubtId },
      data: { status: DoubtStatus.ANSWERED },
    });
  }

  return reply;
};

export const acceptDoubtReplyService = async (
  replyId: string,
  doubtId: string,
  requestingUserId: string,
) => {
  // Verify the requester is the doubt owner
  const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
  if (!doubt) throw new Error("Doubt not found");
  if (doubt.userId !== requestingUserId)
    throw new Error("Only the doubt owner can accept an answer");

  // Unmark any previously accepted reply for this doubt
  await prisma.doubtReply.updateMany({
    where: { doubtId, isAccepted: true },
    data: { isAccepted: false },
  });

  // Mark the selected reply as accepted
  const reply = await prisma.doubtReply.update({
    where: { id: replyId },
    data: { isAccepted: true },
  });

  // Update doubt status to ANSWERED/CLOSED
  await prisma.doubt.update({
    where: { id: doubtId },
    data: { status: DoubtStatus.ANSWERED },
  });

  // Award coins to the reply author
  await awardCoinsService(
    reply.userId,
    COIN_REWARDS.ANSWER_ACCEPTED,
    "Answer accepted",
  );

  // Update reputation for the reply author
  await prisma.user.update({
    where: { id: reply.userId },
    data: { reputation: { increment: COIN_REWARDS.ANSWER_ACCEPTED } },
  });

  return reply;
};

export const awardCoinsService = async (
  userId: string,
  coins: number,
  reason: string,
) => {
  await Promise.all([
    prisma.coinTransaction.create({
      data: { userId, coins, reason },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: coins } },
    }),
  ]);
};

export const updateDoubtStatusService = async (
  id: string,
  status: DoubtStatus,
) => {
  return await prisma.doubt.update({
    where: { id },
    data: { status },
  });
};

export const toggleDoubtPinService = async (id: string) => {
  const doubt = await prisma.doubt.findUnique({ where: { id } });
  if (!doubt) throw new Error("Doubt not found");
  return await prisma.doubt.update({
    where: { id },
    data: { isPinned: !doubt.isPinned },
  });
};

export const toggleDoubtLockService = async (id: string) => {
  const doubt = await prisma.doubt.findUnique({ where: { id } });
  if (!doubt) throw new Error("Doubt not found");
  return await prisma.doubt.update({
    where: { id },
    data: { isLocked: !doubt.isLocked },
  });
};

export const deleteDoubtReplyService = async (id: string) => {
  return await prisma.doubtReply.delete({
    where: { id },
  });
};

export const voteDoubtReplyService = async (
  replyId: string,
  direction: 1 | -1 | 0,
) => {
  if (direction === 0) return null;
  return await prisma.doubtReply.update({
    where: { id: replyId },
    data: {
      upvotes: {
        increment: direction,
      },
    },
  });
};

