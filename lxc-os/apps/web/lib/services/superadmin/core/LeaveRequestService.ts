
import { prisma } from "@/lib/prisma";

export class LeaveRequestService {
    static async createLeaveRequest(data: any) {
        return prisma.leaveRequest.create({ data });
    }

    static async getLeaveRequests(filters?: any) {
        const where: any = {};
        if (filters?.userId) where.userId = filters.userId;
        if (filters?.status) where.status = filters.status;

        return prisma.leaveRequest.findMany({
            where,
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async updateLeaveRequest(id: string, data: any) {
        return prisma.leaveRequest.update({
            where: { id },
            data
        });
    }
}
