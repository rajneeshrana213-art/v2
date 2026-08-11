import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export class HostelExpenseService {
  static async createExpense(data: {
    description: string;
    amount: number;
    date: Date;
    hostelId: string;
  }) {
    return prisma.hostelExpense.create({
      data: {
        id: uuidv4(),
        description: data.description,
        amount: data.amount,
        date: data.date,
        hostel_id: data.hostelId,
      },
    });
  }

  static async updateExpense(id: string, data: {
    description?: string;
    amount?: number;
    date?: Date;
    hostelId?: string;
  }) {
    return prisma.hostelExpense.update({
      where: { id },
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date,
        hostel_id: data.hostelId,
      },
    });
  }

  static async getExpenseById(id: string) {
    return prisma.hostelExpense.findUnique({
      where: { id },
    });
  }

  static async getAllExpenses() {
    return prisma.hostelExpense.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  static async deleteExpense(id: string) {
    return prisma.hostelExpense.delete({
      where: { id },
    });
  }
}
