
import { prisma } from "@/lib/prisma";

export class AssignmentService {
    // --- ASSIGNMENT ---
    static async getAssignments(filters: { classId?: string, subjectId?: string }) {
        const where: any = {};
        if (filters.classId) where.classId = filters.classId;
        if (filters.subjectId) where.subjectId = filters.subjectId;

        return prisma.assignment.findMany({
            where,
            orderBy: { dueDate: 'asc' }
        });
    }

    static async createAssignment(data: any) {
        return prisma.assignment.create({ data });
    }

    // --- HOMEWORK ---
    static async getHomework(filters: { classId?: string }) {
        return prisma.homeWork.findMany({
            where: filters.classId ? { classId: filters.classId } : {},
            orderBy: { dueDate: 'asc' }
        });
    }

    static async createHomework(data: any) {
        return prisma.homeWork.create({ data });
    }

    // --- NEWSPAPER ---
    static async getNewspapers(classId?: string) {
        return prisma.newspaper.findMany({
            where: classId ? { classId } : {},
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } }
        });
    }

    static async createNewspaper(data: any) {
        return prisma.newspaper.create({ data });
    }
}
