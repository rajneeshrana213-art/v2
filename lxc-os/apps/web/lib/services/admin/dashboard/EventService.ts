
import { prisma } from "@/lib/prisma";

export class EventService {
    // events
    static async createEvent(data: any) {
        return prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                schoolId: data.schoolId,
                start: data.start,
                end: data.end,
                attachment: data.attachment,
                targetAudience: data.targetAudience || "ALL",
                roles: { connect: data.roleIds?.map((id: string) => ({ id: Number(id) })) || [] },
                sections: { connect: data.sectionIds?.map((id: string) => ({ id })) || [] },
                Class: { connect: data.classIds?.map((id: string) => ({ id })) || [] },
            },
            include: { roles: true, sections: true, Class: true }
        });
    }

    static async getEvents(schoolId?: string) {
        return prisma.event.findMany({
            where: schoolId ? { schoolId } : {},
            include: { roles: true, sections: true, Class: true }
        });
    }

    static async getEventById(id: string) {
        return prisma.event.findUnique({
            where: { id },
            include: { roles: true, sections: true, Class: true }
        });
    }

    static async updateEvent(id: string, data: any) {
        return prisma.event.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                start: data.start,
                end: data.end,
                attachment: data.attachment,
                targetAudience: data.targetAudience,
                roles: data.roleIds ? { set: data.roleIds.map((id: string) => ({ id: Number(id) })) } : undefined,
                sections: data.sectionIds ? { set: data.sectionIds.map((id: string) => ({ id })) } : undefined,
                Class: data.classIds ? { set: data.classIds.map((id: string) => ({ id })) } : undefined,
            },
            include: { roles: true, sections: true, Class: true }
        });
    }

    static async deleteEvent(id: string) {
        return prisma.event.delete({ where: { id } });
    }

    // holidays
    static async createHoliday(data: any) {
        return prisma.holiday.create({ data });
    }

    static async getHolidays(schoolId?: string) {
        return prisma.holiday.findMany({
            where: schoolId ? { schoolId } : undefined,
            orderBy: { fromday: "asc" }
        });
    }

    static async getHolidayById(id: string) {
        return prisma.holiday.findUnique({ where: { id } });
    }

    static async updateHoliday(id: string, data: any) {
        return prisma.holiday.update({ where: { id }, data });
    }

    static async deleteHoliday(id: string) {
        return prisma.holiday.delete({ where: { id } });
    }
}
