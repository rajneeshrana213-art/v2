import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";

export class UserManagementService {
    static async createUser(data: any) {
        if (data.schoolId) {
            await SubscriptionService.validateUserLimit(data.schoolId);
            await SubscriptionService.checkWriteAccess(data.schoolId);
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            }
        });
    }

    static async getUsers(role?: string) {
        // Broad user listing, potentially filtered by role
        // Be careful with large datasets in production
        return prisma.user.findMany({
            where: role ? { role: role as any } : undefined,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                schoolId: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async updateUser(id: string, data: any) {
        return prisma.user.update({
            where: { id },
            data
        });
    }
}
