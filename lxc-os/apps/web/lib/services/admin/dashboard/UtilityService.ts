
import { prisma } from "@/lib/prisma";

export class UtilityService {
    // --- VISITOR ---
    static async createVisitor(data: any) {
        // Generate Token
        const token = Math.random().toString(36).substring(7).toUpperCase();
        return prisma.visitor.create({ 
            data: { ...data, token } 
        });
    }

    static async getVisitors(schoolId: string) {
        return prisma.visitor.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        });
    }

    // --- MSG91 TEMPLATES ---
    static async upsertMsg91Template(eventType: string, data: any) {
        return prisma.mSG91Template.upsert({
            where: { 
                unique_template_per_event_school: { 
                    eventType, 
                    schoolId: data.schoolId || null
                } 
            },
            update: data,
            create: { eventType, ...data }
        });
    }

    static async getMsg91Templates(schoolId?: string) {
        return prisma.mSG91Template.findMany({
            where: schoolId ? { OR: [{ schoolId }, { schoolId: "GLOBAL" }] } : { schoolId: "GLOBAL" }
        });
    }

    // --- PAYMENT SECRET ---
    static async upsertPaymentSecret(data: any) {
        // Assuming one secret per school or updated by ID
         return prisma.paymentSecret.upsert({
            where: { schoolId: data.schoolId }, // Unique constraint assumed
            update: data,
            create: data
        });
    }

    // --- TRANSACTIONS ---
    static async getTransactions(userId?: string) {
        if (!userId) return prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
        return prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    }

    // --- TEACHER FACE DATA ---
    static async registerTeacherFace(data: any) {
        // Implementation for face registration (referencing legacy logic which used AWS Rekognition or similar)
        // For migration, we'll assume storing the image URL/ID
        return prisma.teacherFaceData.create({ data });
    }

    static async getTeacherFaceData(schoolId: string) {
        return prisma.teacherFaceData.findMany({ where: { teacher: { schoolId } } });
    }

    // --- TEACHER ATTENDANCE ---
    static async getTeacherAttendance(schoolId: string, date?: Date) {
        const where: any = { schoolId };
        if (date) where.date = date;
        return prisma.teacherAttendance.findMany({ where });
    }
}
