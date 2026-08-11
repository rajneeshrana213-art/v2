
import { prisma } from "@/lib/prisma";
import { EventCategory, TargetAudience } from "@prisma/client";

export class EventService {
    static async createEvent(data: any) {
        return prisma.event.create({
            data: {
                title: data.title,
                category: data.category as EventCategory,
                start: new Date(data.start),
                end: new Date(data.end),
                description: data.description,
                attachment: data.attachment,
                targetAudience: data.targetAudience as TargetAudience,
                schoolId: data.schoolId,
            }
        });
    }

    static async getEvents(schoolId: string) {
        return prisma.event.findMany({
            where: { schoolId },
            orderBy: { start: 'asc' }
        });
    }

    static async getEventById(id: string) {
        return prisma.event.findUnique({
            where: { id }
        });
    }

    static async updateEvent(id: string, data: any) {
        return prisma.event.update({
            where: { id },
            data: {
                ...data,
                start: data.start ? new Date(data.start) : undefined,
                end: data.end ? new Date(data.end) : undefined,
            }
        });
    }

    static async deleteEvent(id: string) {
        return prisma.event.delete({
            where: { id }
        });
    }
}
