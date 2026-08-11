import { prisma } from "@/lib/prisma";

export class HrmService {
    // Departments
    static async createDepartment(data: any) {
        return prisma.department.create({ data });
    }

    static async getDepartments(schoolId: string) {
        return prisma.department.findMany({
            where: { schoolId },
            include: { users: { select: { id: true, name: true } } }
        });
    }

    static async getDepartmentById(id: string) {
        return prisma.department.findUnique({
             where: { id },
             include: { users: { select: { id: true, name: true } } }
        });
    }

    static async updateDepartment(id: string, data: any) {
        return prisma.department.update({ where: { id }, data });
    }

    static async deleteDepartment(id: string) {
        return prisma.department.delete({ where: { id } });
    }

    // Designations
    static async createDesignation(data: any) {
        return prisma.designation.create({ data });
    }

    static async getDesignations(schoolId: string) {
        return prisma.designation.findMany({
            where: { schoolId },
            include: { users: { select: { id: true, name: true } } }
        });
    }

    static async getDesignationById(id: string) {
        return prisma.designation.findUnique({
            where: { id },
            include: { users: { select: { id: true, name: true } } }
        });
    }

    static async updateDesignation(id: string, data: any) {
        return prisma.designation.update({ where: { id }, data });
    }

    static async deleteDesignation(id: string) {
        return prisma.designation.delete({ where: { id } });
    }

    // Duties
    static async createDuty(data: any) {
        return prisma.duty.create({ data });
    }

    static async getDuties(schoolId: string) {
        return prisma.duty.findMany({
            where: { schoolId },
            include: { User: { select: { id: true, name: true } } }
        });
    }

    static async getDutyById(id: string) {
        return prisma.duty.findUnique({
             where: { id },
             include: { User: { select: { id: true, name: true } } }
        });
    }

    static async updateDuty(id: string, data: any) {
        return prisma.duty.update({ where: { id }, data });
    }

    static async deleteDuty(id: string) {
        return prisma.duty.delete({ where: { id } });
    }
}
