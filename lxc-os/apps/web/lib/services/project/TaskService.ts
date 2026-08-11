
import { prisma } from "@/lib/prisma";
import { TaskNotificationType } from "@prisma/client";

export class TaskService {
    static async getTasks(filters: any) {
        const where: any = {};
        if (filters.projectId) where.projectId = filters.projectId;
        if (filters.status) where.status = filters.status;
        if (filters.assigneeId) where.assignedToId = filters.assigneeId;
        if (filters.sprintId) where.sprintId = filters.sprintId === 'null' ? null : filters.sprintId;
        
        const page = parseInt(filters.page) || 1;
        const take = parseInt(filters.pageSize) || 10;
        const skip = (page - 1) * take;

        const [tasks, total] = await prisma.$transaction([
            prisma.task.findMany({
                where, skip, take,
                include: { 
                    stage: true, 
                    assignedTo: { select: { name: true, profilePic: true } },
                    labels: { include: { label: true } }
                }
            }),
            prisma.task.count({ where })
        ]);

        return { data: tasks, total }; 
    }

    static async createTask(data: any) {
        const { labelIds, checklist, ...rest } = data;
        const taskData: any = { ...rest };
        if (labelIds) {
            taskData.labels = { create: labelIds.map((id: string) => ({ labelId: id })) };
        }
        if (checklist) {
            taskData.checklist = checklist;
        }

        return prisma.task.create({
            data: taskData,
            include: { stage: true }
        });
    }

    static async updateTask(id: string, data: any) {
         const { labelIds, checklist, ...rest } = data;
         const taskData: any = { ...rest };
         // Handle label updates (deleteMany + create is simplest pattern)
         if (labelIds) {
             taskData.labels = {
                 deleteMany: {},
                 create: labelIds.map((id: string) => ({ labelId: id }))
             };
         }
         if (checklist) taskData.checklist = checklist;

         return prisma.task.update({
             where: { id },
             data: taskData,
             include: { stage: true }
         });
    }
    
    static async deleteTask(id: string) {
        return prisma.task.delete({ where: { id } });
    }

    // --- COMMENTS ---
    static async addComment(data: { id: string, authorId: string, content: string }) {
        const comment = await prisma.comment.create({
            data: { taskId: data.id, authorId: data.authorId, content: data.content }
        });
        // await notifyWatchers... (skip notification logic for migration simplicity or implement later)
        return comment;
    }

    // --- STATUS ---
    static async updateStatus(id: string, stageId: string) {
        return prisma.task.update({
            where: { id },
            data: { stageId }
        });
    }
}
