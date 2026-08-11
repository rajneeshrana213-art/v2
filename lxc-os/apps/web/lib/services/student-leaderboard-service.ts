import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, differenceInCalendarDays } from "date-fns";
import { formatISTDateKey, parseInstitutionalDate } from "@/lib/utils/date-utils";

export const getMonthlyLeaderboardService = async () => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  // Aggregate Quiz Scores
  const quizResults = await prisma.quizResult.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: start, lte: end }
    },
    _sum: { score: true }
  });

  // Aggregate Newspaper Scores
  const newspaperScores = await prisma.newspaperSubmission.groupBy({
    by: ['studentId'],
    where: {
      submittedAt: { gte: start, lte: end }
    },
    _sum: { score: true }
  });

  // Aggregate Doubt Answers
  const doubtAnswers = await prisma.doubtReply.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: start, lte: end }
    },
    _count: { id: true }
  });

  const leaderboardMap: Record<string, any> = {};

  for (const q of quizResults) {
    leaderboardMap[q.userId] = {
      userId: q.userId,
      quizScore: q._sum.score || 0,
      newspaperScore: 0,
      doubtsSolved: 0
    };
  }

  for (const n of newspaperScores) {
    const userId = n.studentId;
    if (!leaderboardMap[userId]) {
      leaderboardMap[userId] = {
        userId,
        quizScore: 0,
        newspaperScore: n._sum.score || 0,
        doubtsSolved: 0
      };
    } else {
      leaderboardMap[userId].newspaperScore = n._sum.score || 0;
    }
  }

  for (const a of doubtAnswers) {
    const userId = a.userId;
    if (!leaderboardMap[userId]) {
      leaderboardMap[userId] = {
        userId,
        quizScore: 0,
        newspaperScore: 0,
        doubtsSolved: a._count.id
      };
    } else {
      leaderboardMap[userId].doubtsSolved = a._count.id;
    }
  }

  const leaderboard = await Promise.all(
    Object.values(leaderboardMap).map(async (entry: any) => {
      const user = await prisma.user.findUnique({
        where: { id: entry.userId },
        select: { name: true, profilePic: true, email: true }
      });

      const totalPoints =
        (entry.quizScore || 0) +
        (entry.newspaperScore || 0) +
        (entry.doubtsSolved * 5);

      return {
        ...entry,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        profilePic: user?.profilePic || '',
        totalPoints
      };
    })
  );

  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return { leaderboard, start, end };
};

export const getClassInternalLeaderboardService = async (classId: string) => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const homeworks = await prisma.homeworkSubmission.groupBy({
    by: ['studentId'],
    where: {
      submittedAt: { gte: start, lte: end },
      homework: { classId }
    },
    _count: { id: true }
  });

  const assignmentResults = await prisma.result.groupBy({
    by: ['studentId'],
    where: {
      assignmentId: { not: null },
      student: { classId },
      createdAt: { gte: start, lte: end }
    },
    _sum: { score: true }
  });

  const examResults = await prisma.result.groupBy({
    by: ['studentId'],
    where: {
      examId: { not: null },
      student: { classId },
      createdAt: { gte: start, lte: end }
    },
    _sum: { score: true }
  });

  const leaderboardMap: Record<string, any> = {};

  for (const hw of homeworks) {
    leaderboardMap[hw.studentId] = {
      studentId: hw.studentId,
      homeworkCount: hw._count.id,
      assignmentScore: 0,
      examScore: 0
    };
  }

  for (const ar of assignmentResults) {
    if (!leaderboardMap[ar.studentId]) {
      leaderboardMap[ar.studentId] = {
        studentId: ar.studentId,
        homeworkCount: 0,
        assignmentScore: ar._sum?.score || 0,
        examScore: 0
      };
    } else {
      leaderboardMap[ar.studentId].assignmentScore = ar._sum?.score || 0;
    }
  }

  for (const er of examResults) {
    if (!leaderboardMap[er.studentId]) {
      leaderboardMap[er.studentId] = {
        studentId: er.studentId,
        homeworkCount: 0,
        assignmentScore: 0,
        examScore: (er._sum?.score ?? 0)
      };
    } else {
      leaderboardMap[er.studentId].examScore = er._sum?.score || 0;
    }
  }

  const leaderboard = await Promise.all(
    Object.values(leaderboardMap).map(async (entry: any) => {
      const student = await prisma.student.findUnique({
        where: { id: entry.studentId },
        select: {
          user: { select: { name: true, profilePic: true } }
        }
      });

      const totalPoints =
        (entry.homeworkCount * 5) +
        (entry.assignmentScore || 0) +
        (entry.examScore || 0);

      return {
        ...entry,
        name: student?.user?.name || 'Unknown',
        profilePic: student?.user?.profilePic || '',
        totalPoints
      };
    })
  );

  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  leaderboard.forEach((entry, i) => (entry.rank = i + 1));

  return { leaderboard, start, end };
};

function calcStreak(dates: Date[]): number {
  // Streak should be computed by institutional calendar day (IST).
  const sorted = Array.from(new Set(dates.map((d) => formatISTDateKey(d)))).sort();
  
  let streak = 0;
  let max = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const diff = differenceInCalendarDays(
        parseInstitutionalDate(sorted[i]),
        parseInstitutionalDate(sorted[i - 1]),
      );
      streak = diff === 1 ? streak + 1 : 1;
    }
    if (streak > max) max = streak;
  }
  return max;
}

export const getRoadmapLeaderboardService = async (classId: string) => {
  const students = await prisma.student.findMany({
    where: { classId },
    select: { id: true, userId: true, user: { select: { name: true, profilePic: true, coins: true } } },
  });

  const leaderboard: any[] = [];

  for (const s of students) {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: s.userId },
      include: { topics: true },
    });

    const completionSum = roadmaps.reduce((sum, r) => sum + (r.progress || 0), 0);
    const completionRate = roadmaps.length ? Math.round(completionSum / roadmaps.length) : 0;

    const dates: Date[] = [];
    for (const r of roadmaps) {
      for (const t of r.topics) {
        if (t.completedAt) dates.push(t.completedAt);
      }
    }

    const streak = calcStreak(dates);
    const coins = s.user?.coins || 0;
    const score = streak * 10 + coins + completionRate;

    leaderboard.push({
      studentId: s.id,
      name: s.user?.name || "-",
      profilePic: s.user?.profilePic || "",
      streak,
      coins,
      completionRate,
      score,
    });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard.forEach((entry, i) => (entry.rank = i + 1));

  return leaderboard;
};
