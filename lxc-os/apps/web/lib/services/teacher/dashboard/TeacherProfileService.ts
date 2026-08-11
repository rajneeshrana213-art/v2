
import { prisma } from "@/lib/prisma";

export class TeacherProfileService {
    static async getProfile(userId: string) {
        return prisma.teacher.findFirst({
            where: { userId },
            include: { user: true, school: true }
        });
    }

    static async getLeaveRequests(userId: string) {
        return prisma.leaveRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async createLeaveRequest(data: any) {
        return prisma.leaveRequest.create({ data });
    }
}
