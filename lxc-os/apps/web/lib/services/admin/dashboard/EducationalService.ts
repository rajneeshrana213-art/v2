
import { prisma } from "@/lib/prisma";

export class EducationalService {
    // --- CLASSROOM ---
    static async getClassrooms(schoolId: string) {
        const classes = await prisma.class.findMany({
            where: { schoolId },
            select: { id: true, name: true, roomNumber: true, capacity: true },
            orderBy: { name: "asc" }
        });
        
        return classes.map(cls => ({
            id: cls.id,
            roomNumber: cls.roomNumber || cls.name,
            name: cls.roomNumber || cls.name,
            classId: cls.id,
            className: cls.name,
            capacity: cls.capacity
        }));
    }

    // --- COMPETITION ---
    static async createCompetition(data: any) {
        return prisma.competition.create({ data });
    }

    static async getCompetitions(userId?: string) {
        // Just a basic list for now, adapt based on exact requirement
        return prisma.competition.findMany({ 
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });
    }

    static async registerForCompetition(data: any) {
        // Note: CompetitionParticipant model doesn't exist in schema.
        // The Competition model represents a user's competition entry, not a participant registration.
        // This functionality requires schema changes to properly support registering users for competitions.
        throw new Error("Competition participant registration is not yet implemented. The schema does not include a CompetitionParticipant model.");
    }

    // --- PYQ ---
    static async createPYQ(data: any) {
        return prisma.pYQ.create({ data });
    }

    static async getPYQs(subjectId?: string, classId?: string) {
        const where: any = {};
        if (subjectId) where.subjectId = subjectId;
        if (classId) where.classId = classId;
        return prisma.pYQ.findMany({ where, include: { uploader: true } });
    }

    // --- DOUBT & ANSWER ---
    static async createDoubt(data: any) {
        return prisma.doubt.create({ data });
    }

    static async createAnswer(data: any) {
        return prisma.doubtReply.create({ data });
    }

    static async getDoubts(classId?: string, subjectId?: string) {
        const where: any = {};
        if (classId) where.classId = classId;
        if (subjectId) where.subjectId = subjectId;
        return prisma.doubt.findMany({ 
            where, 
            include: { 
                replies: { include: { user: true } },
                user: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // --- LEADERBOARD ---
    static async getLeaderboard() {
         return prisma.leaderboard.findMany({
             orderBy: { points: 'desc' },
             take: 50,
             include: { user: { select: { name: true, profilePic: true } } }
         });
    }

    // --- PROMOTION ---
    static async promoteStudent(data: any) {
        // Atomic transaction to update student class/section/session
        return prisma.$transaction(async (tx) => {
             // Create promotion record
             await tx.studentPromotion.create({
                 data: {
                     studentId: data.studentId,
                     fromClassId: data.fromClassId,
                     toClassId: data.toClassId,
                     fromSection: data.fromSection,
                     toSection: data.toSection,
                     academicYear: data.academicYear,
                     toSession: data.toSession
                 }
             });

             return tx.student.update({
                 where: { id: data.studentId },
                 data: {
                     classId: data.toClassId,
                     // section is not present in Student model based on schema review
                 }
             });
        });
    }
}
