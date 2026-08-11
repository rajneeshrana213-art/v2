
import { prisma } from "@/lib/prisma";

export class SupportService {
    // --- TICKETS ---
    static async createTicket(data: any) {
        // Enum mapping if needed for priority/status
        return prisma.ticket.create({ data });
    }

    static async getTickets(filters?: any) {
        const where: any = {};
        if (filters?.schoolId) where.schoolId = filters.schoolId;
        if (filters?.status) where.status = filters.status;
        
        return prisma.ticket.findMany({
            where,
            include: { User: true, assignedTo: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    // --- FEEDBACK ---
    static async createFeedback(data: any) {
        return prisma.feedback.create({ data });
    }

    static async getFeedbacks(schoolId?: string) {
         return prisma.feedback.findMany({
             where: schoolId ? { schoolId } : {},
             orderBy: { createdAt: 'desc' }
         });
    }

    // --- CONTACT MESSAGES ---
    static async getContactMessages() {
        return prisma.contactMessage.findMany({
            orderBy: { date: 'desc' }
        });
    }

    // --- FEATURE REQUESTS ---
    static async getFeatureRequests(filters: any) {
        const where: any = {};
        if (filters.schoolId) where.schoolId = filters.schoolId;
        if (filters.moduleName) where.moduleName = filters.moduleName;
        
        return prisma.schoolFeatureRequests.findMany({
            where,
            include: { school: true, user: true },
            orderBy: filters.sortBy ? { [filters.sortBy]: filters.sortOrder || 'desc' } : { createdAt: 'desc' }
        });
    }
}
