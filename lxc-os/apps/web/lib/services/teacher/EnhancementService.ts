import { prisma } from "@/lib/prisma";

export interface QuizQuestionInput {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizInput {
  title: string;
  subjectId: string;
  classId: string;
  timeLimit: number;
  difficulty: string;
  points: number;
  startDate: Date;
  endDate: Date;
  questions: QuizQuestionInput[];
}

export const createQuizService = async (data: QuizInput) => {
  const now = new Date();
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (start < now) {
    throw new Error("Start date cannot be in the past");
  }
  if (end <= start) {
    throw new Error("End date must be after start date");
  }

  return await prisma.quiz.create({
    data: {
      title: data.title,
      subjectId: data.subjectId,
      classId: data.classId,
      timeLimit: data.timeLimit,
      difficulty: data.difficulty,
      points: data.points,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      questions: {
        create: data.questions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      },
    },
    include: {
      questions: true,
    },
  });
};

export const getQuizzesByTeacher = async (classId?: string) => {
  return await prisma.quiz.findMany({
    where: classId ? { classId } : {},
    include: {
      subject: true,
      questions: true,
      _count: {
        select: { quizResults: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteQuizService = async (quizId: string) => {
  return await prisma.quiz.delete({
    where: { id: quizId },
  });
};

// Article Services
export interface ArticleInput {
  title: string;
  content: string;
  attachment?: string;
  instructions?: string;
  submissionType: string;
  classId: string;
  subjectId?: string;
  userId: string;
}

export const createArticleService = async (data: ArticleInput) => {
  return await prisma.newspaper.create({
    data: {
      title: data.title,
      content: data.content,
      attachment: data.attachment,
      instructions: data.instructions,
      submissionType: data.submissionType,
      classId: data.classId,
      subjectId: data.subjectId,
      userId: data.userId,
    },
  });
};

export const getArticlesService = async (classId?: string) => {
  return await prisma.newspaper.findMany({
    where: classId ? { classId } : {},
    include: {
      subject: true,
      _count: {
        select: { NewspaperSubmission: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteArticleService = async (id: string) => {
  return await prisma.newspaper.delete({
    where: { id },
  });
};

// Evaluation & Submissions
export const getArticleSubmissionsService = async (newspaperId: string) => {
  return await prisma.newspaperSubmission.findMany({
    where: { newspaperId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const evaluateArticleSubmissionService = async (submissionId: string, score: number, feedback: string) => {
  const submission = await prisma.newspaperSubmission.update({
    where: { id: submissionId },
    data: { score, feedback },
    include: {
      student: true,
      newspaper: true
    }
  });

  // Trigger enhancement leaderboard update
  return submission;
};

export const evaluateHomeworkService = async (submissionId: string, score: number, feedback: string) => {
  return await prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: { score, feedback }
  });
};

export const createStudentEvaluationService = async (data: {
  studentId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  score: number;
  type: string;
  feedback?: string;
}) => {
  return await prisma.studentEvaluation.create({
    data: {
      ...data,
      score: Number(data.score),
    },
  });
};
