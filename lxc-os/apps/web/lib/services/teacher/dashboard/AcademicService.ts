
import { prisma } from "@/lib/prisma";

export class AcademicService {
    // --- CLASS ---
    static async getClasses(schoolId: string) {
        return prisma.class.findMany({
            where: { schoolId },
            include: { 
                Section: true 
            }
        });
    }

    static async createClass(data: any) {
        return prisma.class.create({ data });
    }

    static async updateClass(id: string, data: any) {
        return prisma.class.update({ where: { id }, data });
    }

    // --- SECTION ---
    static async getSections(classId: string) {
        return prisma.section.findMany({ where: { classId } });
    }
    
    static async createSection(data: any) {
        // Assuming Section model exists
        return prisma.section.create({ data });
    }

    // --- SUBJECT ---
    static async getSubjects(filters: { classId?: string, schoolId?: string }) {
        const where: any = {};
        if (filters.classId) where.classId = filters.classId;
        if (filters.schoolId) where.schoolId = filters.schoolId;
        
        return prisma.subject.findMany({ where });
    }

    static async createSubject(data: any) {
        return prisma.subject.create({ data });
    }

    // --- LESSON ---
    static async getLessons(filters: { classId?: string, teacherId?: string, day?: any }) {
        const where: any = {};
        if (filters.classId) where.classId = filters.classId;
        if (filters.teacherId) where.teacherId = filters.teacherId;
        if (filters.day) where.day = filters.day;

        return prisma.lesson.findMany({ 
            where,
            include: { subject: true, class: true },
            orderBy: { startTime: 'asc' }
        });
    }

    static async createLesson(data: any) {
        return prisma.lesson.create({ data });
    }
}
