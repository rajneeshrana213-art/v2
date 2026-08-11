import { prisma } from "@/lib/prisma";

export class AssessmentService {
  // --- EXAM ---
  static async getExams(filters: { classId?: string; subjectId?: string }) {
    const where: any = {};
    if (filters.classId) where.classId = filters.classId;
    if (filters.subjectId) where.subjectId = filters.subjectId;

    return prisma.exam.findMany({
      where,
      orderBy: { startTime: "desc" },
    });
  }

  static async createExam(data: any) {
    return prisma.exam.create({ data });
  }

  // --- RESULTS ---
  static async getResults(examId: string) {
    return prisma.result.findMany({
      where: { examId },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            academicRecords: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { rollNumber: true },
            },
          },
          select: { userId: true },
        },
      },
    });
  }

  static async enterResult(data: any) {
    return prisma.result.create({ data });
  }

  // --- GRADE ---
  static async getGrades() {
    return prisma.grade.findMany();
  }
}
