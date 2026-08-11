import { prisma } from "@/lib/prisma";

export const updateClassLeaderboard = async (classId: string) => {
  const students = await prisma.student.findMany({
    where: { classId },
    include: {
      results: {
        include: { exam: true, assignment: true },
      },
      HomeworkSubmission: true,
      attendances: true,
      studentEvaluations: {
          where: { classId }
      }
    },
  });

  const scores = students.map((student) => {
    // 1. Exam (40%)
    const examResults = student.results.filter(r => r.examId);
    const avgExamScore = examResults.length > 0 
      ? examResults.reduce((acc, curr) => acc + (curr.score / (curr.exam?.totalMarks || 100)), 0) / examResults.length
      : 0;

    // 2. Assignment (25%)
    const assignmentResults = student.results.filter(r => r.assignmentId);
    const avgAssignmentScore = assignmentResults.length > 0
      ? assignmentResults.reduce((acc, curr) => acc + (curr.score / 100), 0) / assignmentResults.length // Assuming 100 max if not specified
      : 0;

    // 3. Homework (15%)
    const avgHomeworkScore = student.HomeworkSubmission.length > 0
      ? student.HomeworkSubmission.reduce((acc, curr) => acc + ((curr.score || 0) / 100), 0) / student.HomeworkSubmission.length
      : 0;

    // 4. Attendance (10%)
    const totalDays = student.attendances.length;
    const presentDays = student.attendances.filter(a => a.present).length;
    const attendanceRate = totalDays > 0 ? presentDays / totalDays : 0;

    // 5. Teacher Evaluation (10%)
    const avgEvalScore = student.studentEvaluations.length > 0
      ? student.studentEvaluations.reduce((acc, curr) => acc + (curr.score / 100), 0) / student.studentEvaluations.length
      : 0;

    const totalScore = (avgExamScore * 40) + (avgAssignmentScore * 25) + (avgHomeworkScore * 15) + (attendanceRate * 10) + (avgEvalScore * 10);

    return {
      studentId: student.id,
      score: totalScore,
    };
  });

  // Bulk update or individual update for leaderboard
  for (const s of scores) {
    await prisma.classLeaderboard.upsert({
      where: { studentId: s.studentId },
      update: { academicScore: s.score, classId },
      create: { studentId: s.studentId, academicScore: s.score, classId },
    });
  }

  // Update Ranks
  const updatedLeaderboard = await prisma.classLeaderboard.findMany({
    where: { classId },
    orderBy: { academicScore: "desc" },
  });

  for (let i = 0; i < updatedLeaderboard.length; i++) {
    await prisma.classLeaderboard.update({
      where: { id: updatedLeaderboard[i].id },
      data: { rank: i + 1 },
    });
  }
};

export const updateEnhancementLeaderboard = async (schoolId: string) => {
  const students = await prisma.student.findMany({
    where: { schoolId },
    include: {
      user: {
          include: {
              quizzes: {
                  include: { quiz: true }
              },
              NewspaperSubmission: true
          }
      }
    },
  });

  const scores = students.map((student) => {
    // 1. Quiz Performance (70%)
    const quizResults = student.user?.quizzes || [];
    const totalQuizPoints = quizResults.reduce((acc: any, curr: any) => acc + (curr.score / (curr.quiz.points || 100)), 0);
    const avgQuizScore = quizResults.length > 0 ? totalQuizPoints / quizResults.length : 0;

    // 2. Article Reading (30%)
    const articleSubmissions = student.user?.NewspaperSubmission || [];
    const avgArticleScore = articleSubmissions.length > 0
      ? articleSubmissions.reduce((acc: any, curr: any) => acc + ((curr.score || 0) / 100), 0) / articleSubmissions.length
      : 0;

    const totalScore = (avgQuizScore * 70) + (avgArticleScore * 30);

    return {
      studentId: student.id,
      score: totalScore,
    };
  });

  for (const s of scores) {
    await prisma.enhancementLeaderboard.upsert({
      where: { studentId: s.studentId },
      update: { enhancementScore: s.score, schoolId },
      create: { studentId: s.studentId, enhancementScore: s.score, schoolId },
    });
  }

  // Update Ranks (Global)
  const updatedLeaderboard = await prisma.enhancementLeaderboard.findMany({
    where: { schoolId },
    orderBy: { enhancementScore: "desc" },
  });

  for (let i = 0; i < updatedLeaderboard.length; i++) {
    await prisma.enhancementLeaderboard.update({
      where: { id: updatedLeaderboard[i].id },
      data: { rank: i + 1 },
    });
  }
};
