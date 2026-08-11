
import { prisma } from "@/lib/prisma";

export class AgileService {
    // --- SPRINTS ---
    static async getSprints(projectId: string) {
        return prisma.sprint.findMany({
            where: { projectId },
            orderBy: { startDate: 'desc' }
        });
    }

    static async createSprint(data: any) {
        return prisma.sprint.create({ data });
    }

    static async updateSprint(id: string, data: any) {
        return prisma.sprint.update({ where: { id }, data });
    }

    static async deleteSprint(id: string) {
        return prisma.sprint.delete({ where: { id } });
    }

    // --- EPICS ---
    static async getEpics(projectId: string) {
        return prisma.epic.findMany({
            where: { projectId },
            include: { tasks: true }
        });
    }

    static async createEpic(data: any) {
        return prisma.epic.create({ data });
    }

    static async updateEpic(id: string, data: any) {
        return prisma.epic.update({ where: { id }, data });
    }
    
    static async deleteEpic(id: string) {
        return prisma.epic.delete({ where: { id } });
    }
}
