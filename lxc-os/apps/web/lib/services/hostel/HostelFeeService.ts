import { prisma } from "@/lib/prisma";
import { FeeType, FeeStatus } from "@prisma/client";

export class HostelFeeService {
  static async createFee(data: {
    amount: number;
    dueDate: Date;
    studentId: string;
    hostelId: string;
    type: string;
  }) {
    return prisma.hostelFee.create({
      data: {
        amount: data.amount,
        due_date: data.dueDate,
        student_id: data.studentId,
        hostel_id: data.hostelId,
        type: data.type as FeeType,
        status: FeeStatus.UNPAID,
      },
    });
  }

  static async updateFee(id: string, data: {
    amount?: number;
    dueDate?: Date;
    status?: string;
  }) {
    return prisma.hostelFee.update({
      where: { id },
      data: {
        amount: data.amount,
        due_date: data.dueDate,
        status: data.status as FeeStatus,
      },
    });
  }

  static async getFeeById(id: string) {
    return prisma.hostelFee.findUnique({
      where: { id },
      include: {
        Student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  static async getAllFees() {
    return prisma.hostelFee.findMany({
      include: {
        Student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  static async deleteFee(id: string) {
    return prisma.hostelFee.delete({
      where: { id },
    });
  }
}
