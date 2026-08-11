import { prisma } from "@/lib/prisma";
import { BillingType, FeeFrequency, Prisma } from "@prisma/client";

export class FeeHeadService {
  static async createFeeHead(data: {
    schoolId: string;
    name: string;
    description?: string;
    revenueAccountId: string;
    priority?: number;
    isActive?: boolean;
    type?: BillingType;
    frequency?: FeeFrequency;
    isMandatory?: boolean;
    isConcessionEligible?: boolean;
  }) {
    return prisma.feeHead.create({
      data: {
        schoolId: data.schoolId,
        name: data.name,
        description: data.description,
        revenueAccountId: data.revenueAccountId,
        priority: data.priority ?? 0,
        isActive: data.isActive ?? true,
        type: data.type,
        frequency: data.frequency,
        isMandatory: data.isMandatory,
        isConcessionEligible: data.isConcessionEligible,
      },
    });
  }

  static async getFeeHeads(schoolId: string, filters?: { isActive?: boolean }) {
    const where: Prisma.FeeHeadWhereInput = {
      schoolId,
    };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return prisma.feeHead.findMany({
      where,
      include: {
        revenueAccount: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        priority: "asc",
      },
    });
  }

  static async updateFeeHead(
    id: string,
    data: {
      name?: string;
      description?: string;
      revenueAccountId?: string;
      priority?: number;
      isActive?: boolean;
      type?: BillingType;
      frequency?: FeeFrequency;
      isMandatory?: boolean;
      isConcessionEligible?: boolean;
    },
  ) {
    return prisma.feeHead.update({
      where: { id },
      data,
    });
  }

  static async deleteFeeHead(id: string) {
    // Check if used in structures or student plans
    return prisma.feeHead.delete({
      where: { id },
    });
  }
}
