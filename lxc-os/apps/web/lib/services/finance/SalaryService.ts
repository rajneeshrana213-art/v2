import { prisma } from "@/lib/prisma";
import { Prisma, paymentMethod, SalaryPaymentStatus } from "@prisma/client";

export class SalaryService {
  static async recordPayment(data: {
    schoolId: string;
    teacherId: string;
    amount: number;
    period: string;
    method: any;
  }) {
    return prisma.salaryPayment.create({
      data: {
        schoolId: data.schoolId,
        teacherId: data.teacherId,
        amount: data.amount,
        period: data.period,
        method: data.method as paymentMethod,
        status: SalaryPaymentStatus.PAID,
        paymentDate: new Date(),
      },
    });
  }

  static async getTeacherPayments(teacherId: string) {
    return prisma.salaryPayment.findMany({
      where: { teacherId },
      orderBy: { paymentDate: 'desc' },
    });
  }

  static async getPaymentsByDateRange(startDate: Date, endDate: Date, schoolId?: string) {
    const where: Prisma.SalaryPaymentWhereInput = {
      paymentDate: {
        gte: startDate,
        lte: endDate,
      },
      status: SalaryPaymentStatus.PAID,
    };

    if (schoolId) {
      where.schoolId = schoolId;
    }

    return prisma.salaryPayment.findMany({
      where,
      include: {
        teacher: {
          select: {
            user: { select: { name: true, email: true } }
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
