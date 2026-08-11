import { prisma } from "../../prisma";

export class TransactionService {
  static async getSchoolTransactions(schoolId: string) {
    return await prisma.payment.findMany({
      where: {
        schoolId: schoolId,
        studentId: { not: null }, // Filter for student fee payments
      },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentDate: true,
        paymentMethod: true,
        createdAt: true,
        receiptUrl: true,
        student: {
          select: {
            id: true,
            admissionNo: true,
            academicRecords: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { rollNumber: true },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        school: {
          select: {
            id: true,
            schoolName: true,
          },
        },
      },
      take: 100,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getPlanTransactions(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const payments = await prisma.payment.findMany({
      where: {
        subscription: {
          some: {},
        },
      },
      include: {
        subscription: {
          include: {
            plan: true,
            school: true,
          },
        },
        student: true,
        school: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = payments.map((payment) => ({
      transactionId: payment.id,
      subscriptionId: payment.subscription?.[0]?.id || null,
      providerName:
        payment.subscription?.[0]?.school?.schoolName ||
        payment.school?.schoolName ||
        "N/A",
      planType: payment.subscription?.[0]?.plan?.name || "N/A",
      transactionDate: payment.createdAt,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      startDate: payment.subscription?.[0]?.startDate || null,
      endDate: payment.subscription?.[0]?.endDate || null,
      status: payment.status,
    }));

    return {
      data: formatted,
      total: formatted.length, // approximation, real total needs count
    };
  }

  static async getStudentTransactions(studentId: string) {
    // Fee model removed - uses payments directly
    return await prisma.payment.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
        school: true,
      },
    });
  }

  static async getSchoolSubscriptions(schoolId: string) {
    return await prisma.subscription.findMany({
      where: {
        schoolId: schoolId,
      },
      include: {
        plan: true,
        school: true,
      },
    });
  }
}
