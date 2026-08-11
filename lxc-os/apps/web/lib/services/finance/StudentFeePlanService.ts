import { prisma } from "@/lib/prisma";
import { DemandGenerationService } from "./DemandGenerationService";

export class StudentFeePlanService {
  /**
   * Assign fee structure to a student and immediately generate demand
   */
  static async assignFeeStructure(
    data: {
      schoolId: string;
      academicYearId: string;
      studentId: string;
      feeStructureId: string;
      createdBy: string;
    },
    txClient?: any,
    skipDemand = false,
  ) {
    const execute = async (tx: any) => {
      // 1. Upsert the StudentFeePlan
      const studentFeePlan = await tx.studentFeePlan.upsert({
        where: {
          schoolId_academicYearId_studentId: {
            schoolId: data.schoolId,
            academicYearId: data.academicYearId,
            studentId: data.studentId,
          },
        },
        update: {
          feeStructureId: data.feeStructureId,
          isActive: true,
        },
        create: {
          schoolId: data.schoolId,
          academicYearId: data.academicYearId,
          studentId: data.studentId,
          feeStructureId: data.feeStructureId,
          isActive: true,
        },
      });

      // 2. Clear existing head amounts for this student plan
      await tx.studentFeePlanHead.deleteMany({
        where: { studentFeePlanId: studentFeePlan.id },
      });

      // 3. Copy head amounts from the FeeStructure
      const structureHeads = await tx.feeStructureHead.findMany({
        where: { feeStructureId: data.feeStructureId },
      });

      if (structureHeads.length > 0) {
        await tx.studentFeePlanHead.createMany({
          data: structureHeads.map((sh: any) => ({
            studentFeePlanId: studentFeePlan.id,
            feeHeadId: sh.feeHeadId,
            amount: sh.amount,
          })),
        });
      }

      // 4. Immediately trigger demand generation for the current month/year
      // This ensures outstanding balance is updated instantly
      if (!skipDemand) {
        const now = new Date();
        await DemandGenerationService.generateDemand(
          {
            schoolId: data.schoolId,
            academicYearId: data.academicYearId,
            studentIds: [data.studentId],
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            createdBy: data.createdBy,
          },
          tx,
        );
      }

      return studentFeePlan;
    };

    if (txClient) return execute(txClient);
    return prisma.$transaction(async (tx) => execute(tx), { timeout: 15000 });
  }

  static async getStudentFeePlan(
    schoolId: string,
    academicYearId: string,
    studentId: string,
  ) {
    return prisma.studentFeePlan.findUnique({
      where: {
        schoolId_academicYearId_studentId: {
          schoolId,
          academicYearId,
          studentId,
        },
      },
      include: {
        feeHeadAmounts: {
          include: {
            feeHead: true,
          },
        },
        feeStructure: true,
      },
    });
  }

  static async listAssignments(schoolId: string, academicYearId: string) {
    return prisma.studentFeePlan.findMany({
      where: { schoolId, academicYearId },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            class: { select: { name: true } },
          },
        },
        feeStructure: { select: { name: true } },
      },
    });
  }

  static async bulkAssignFeeStructure(data: {
    schoolId: string;
    academicYearId: string;
    feeStructureId: string;
    classId?: string;
    sectionId?: string;
    createdBy: string;
  }) {
    // 1. Fetch matching students
    const where: any = {
      schoolId: data.schoolId,
      status: "ACTIVE",
    };

    if (data.classId) where.classId = data.classId;
    if (data.sectionId) where.sectionId = data.sectionId;

    const students = await prisma.student.findMany({
      where,
      select: { id: true },
    });

    if (students.length === 0) return { count: 0 };

    // 2. Perform all assignments in ONE transaction
    return prisma.$transaction(
      async (tx) => {
        let count = 0;
        const studentIds = students.map((s) => s.id);

        for (const studentId of studentIds) {
          await this.assignFeeStructure(
            {
              schoolId: data.schoolId,
              academicYearId: data.academicYearId,
              studentId,
              feeStructureId: data.feeStructureId,
              createdBy: data.createdBy,
            },
            tx,
            true,
          ); // Skip individual demand generation for performance
          count++;
        }

        // 3. Trigger bulk demand generation once at the end
        const now = new Date();
        await DemandGenerationService.generateDemand(
          {
            schoolId: data.schoolId,
            academicYearId: data.academicYearId,
            studentIds,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            createdBy: data.createdBy,
          },
          tx,
        );

        return { count };
      },
      {
        timeout: 60000, // Increase timeout for bulk operations
      },
    );
  }
}
