import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class IncomeService {
  static async createIncome(data: {
    schoolId: string;
    source: string;
    date: string | Date;
    amount: number;
    description: string;
    billUrl?: string;
    invoiceNumber?: string;
    paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CHEQUE' | 'NET_BANKING';
  }) {
    return prisma.schoolIncome.create({
      data: {
        schoolId: data.schoolId,
        source: data.source,
        date: new Date(data.date),
        amount: data.amount,
        description: data.description,
        billUrl: data.billUrl,
        invoiceNumber: data.invoiceNumber,
        paymentMethod: (data.paymentMethod === 'CARD'
          ? 'CREDIT_CARD'
          : data.paymentMethod === 'NET_BANKING'
          ? 'BANK_TRANSFER'
          : data.paymentMethod) as any,
      },
    });
  }

  static async getIncomes(schoolId: string) {
    return prisma.schoolIncome.findMany({
      where: { schoolId },
      orderBy: { date: 'desc' },
    });
  }

  static async getIncomeById(id: string) {
    return prisma.schoolIncome.findUnique({
      where: { id },
    });
  }

  static async updateIncome(
    id: string,
    data: {
      source: string;
      date: string | Date;
      amount: number;
      description: string;
      invoiceNumber?: string;
      paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CHEQUE' | 'NET_BANKING';
    }
  ) {
    return prisma.schoolIncome.update({
      where: { id },
      data: {
        source: data.source,
        date: new Date(data.date),
        amount: data.amount,
        description: data.description,
        invoiceNumber: data.invoiceNumber,
        paymentMethod: (data.paymentMethod === 'CARD'
          ? 'CREDIT_CARD'
          : data.paymentMethod === 'NET_BANKING'
          ? 'BANK_TRANSFER'
          : data.paymentMethod) as any,
      },
    });
  }

  static async deleteIncome(id: string) {
    return prisma.schoolIncome.delete({
      where: { id },
    });
  }
}
