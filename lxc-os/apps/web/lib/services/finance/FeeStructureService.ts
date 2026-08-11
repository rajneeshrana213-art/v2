import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class FeeStructureService {
  static async createFeeStructure(data: {
    schoolId: string;
    academicYearId: string;
    name: string;
    description?: string;
    classId?: string;
    isActive?: boolean;
    createdBy?: string;
  }) {
    return prisma.feeStructure.create({
      data: {
        schoolId: data.schoolId,
        academicYearId: data.academicYearId,
        name: data.name,
        description: data.description,
        classId: data.classId,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async getFeeStructures(
    schoolId: string, 
    academicYearId: string, 
    filters?: { classId?: string }
  ) {
    const where: Prisma.FeeStructureWhereInput = {
      schoolId,
      academicYearId,
    };

    if (filters?.classId) {
      where.classId = filters.classId;
    }

    return prisma.feeStructure.findMany({
      where,
      include: {
        feeHeadAmounts: {
          include: {
            feeHead: true,
          },
        },
        class: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getFeeStructureById(id: string) {
    return prisma.feeStructure.findUnique({
      where: { id },
      include: {
        feeHeadAmounts: {
          include: {
            feeHead: true,
          },
        },
        class: true,
      },
    });
  }

  static async updateFeeStructure(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    return prisma.feeStructure.update({
      where: { id },
      data,
    });
  }

  static async deleteFeeStructure(id: string) {
    // Check if used in student fee plans or logic that prevents deletion
    const used = await prisma.studentFeePlan.findFirst({
      where: { feeStructureId: id },
    });

    if (used) {
      throw new Error(
        "Cannot delete fee structure as it is assigned to students."
      );
    }

    return prisma.feeStructure.delete({
      where: { id },
    });
  }

  static async setFeeHeadAmounts(
    feeStructureId: string,
    heads: { feeHeadId: string; amount: number }[]
  ) {
    // Transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      // Delete existing mappings
      await tx.feeStructureHead.deleteMany({
        where: { feeStructureId },
      });

      // Create new mappings
      return tx.feeStructureHead.createMany({
        data: heads.map((h) => ({
          feeStructureId,
          feeHeadId: h.feeHeadId,
          amount: h.amount,
        })),
      });
    }, {
      maxWait: 5000,
      timeout: 10000,
    });
  }

  static async getFeeHeadAmounts(feeStructureId: string) {
    return prisma.feeStructureHead.findMany({
      where: { feeStructureId },
      include: {
        feeHead: true,
      },
    });
  }
}
