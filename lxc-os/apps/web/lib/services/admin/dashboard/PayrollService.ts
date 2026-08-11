
import { prisma } from "@/lib/prisma";

export class PayrollService {
    static async createPayroll(data: any) {
        const netSalary = data.grossSalary - (data.deductions || 0);
        return prisma.payroll.create({
            data: {
                userId: data.userId,
                schoolId: data.schoolId,
                periodStart: data.periodStart,
                periodEnd: data.periodEnd,
                grossSalary: data.grossSalary,
                deductions: data.deductions || 0,
                netSalary
            }
        });
    }

    static async getPayrolls(schoolId: string) {
        return prisma.payroll.findMany({
            where: { schoolId },
            include: { user: { select: { id: true, name: true } } }
        });
    }

    static async getPayrollById(id: string) {
        return prisma.payroll.findUnique({
            where: { id },
            include: { user: { select: { id: true, name: true } } }
        });
    }

    static async updatePayroll(id: string, data: any) {
        const existing = await prisma.payroll.findUnique({ where: { id } });
        if (!existing) throw new Error("Payroll not found");

        const gross = data.grossSalary ?? existing.grossSalary;
        const ded = data.deductions ?? existing.deductions;
        const netSalary = gross - ded;

        return prisma.payroll.update({
            where: { id },
            data: {
                grossSalary: gross,
                deductions: ded,
                netSalary,
                paymentDate: data.paymentDate,
                status: data.status
            }
        });
    }

    static async deletePayroll(id: string) {
        return prisma.payroll.delete({ where: { id } });
    }

    static async getMyPayrolls(userId: string) {
        return prisma.payroll.findMany({
            where: { userId },
            orderBy: { periodStart: 'desc' }
        });
    }
}
