import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class ExpenseService {
  // Categories
  static async createCategory(data: { name: string; schoolId: string }) {
    return prisma.schoolExpenseCategory.create({
      data,
    });
  }

  static async getCategories(schoolId: string) {
    return prisma.schoolExpenseCategory.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateCategory(id: string, name: string) {
    return prisma.schoolExpenseCategory.update({
      where: { id },
      data: { name },
    });
  }

  static async deleteCategory(id: string) {
    return prisma.schoolExpenseCategory.delete({
      where: { id },
    });
  }

  // Expenses
  static async createExpense(data: {
    categoryId?: string;
    newCategoryName?: string;
    schoolId: string;
    date: string | Date;
    amount: number;
    description: string;
    billUrl?: string;
    invoiceNumber?: string;
    paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CHEQUE' | 'NET_BANKING';
  }) {
    let finalCategoryId = data.categoryId;

    if (!finalCategoryId && data.newCategoryName) {
      const category = await this.createCategory({
        name: data.newCategoryName,
        schoolId: data.schoolId
      });
      finalCategoryId = category.id;
    }

    if (!finalCategoryId) throw new Error("Category ID or New Category Name is required");

    return prisma.schoolExpense.create({
      data: {
        categoryId: finalCategoryId,
        schoolId: data.schoolId,
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

  static async getExpenses(schoolId: string) {
    return prisma.schoolExpense.findMany({
      where: { schoolId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }

  static async getExpenseById(id: string) {
    return prisma.schoolExpense.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  static async updateExpense(
    id: string,
    data: {
      categoryId?: string;
      newCategoryName?: string;
      schoolId?: string;
      date: string | Date;
      amount: number;
      description: string;
      billUrl?: string;
      invoiceNumber?: string;
      paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CHEQUE' | 'NET_BANKING';
    }
  ) {
    let finalCategoryId = data.categoryId;

    if (!finalCategoryId && data.newCategoryName && data.schoolId) {
      const category = await this.createCategory({
        name: data.newCategoryName,
        schoolId: data.schoolId
      });
      finalCategoryId = category.id;
    }

    return prisma.schoolExpense.update({
      where: { id },
      data: {
        categoryId: finalCategoryId,
        date: new Date(data.date),
        amount: data.amount,
        description: data.description,
        billUrl: data.billUrl,
        invoiceNumber: data.invoiceNumber,
        // Map frontend/payment schema values onto DB enum; fallback via loose cast
        paymentMethod: (data.paymentMethod === 'CARD'
          ? 'CREDIT_CARD'
          : data.paymentMethod === 'NET_BANKING'
          ? 'BANK_TRANSFER'
          : data.paymentMethod) as any,
      },
    });
  }

  static async deleteExpense(id: string) {
    return prisma.schoolExpense.delete({
      where: { id },
    });
  }
}
