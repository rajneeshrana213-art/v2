
import { prisma } from "@/lib/prisma";

export class HolidayService {
    static async createHoliday(data: any) {
        return prisma.holiday.create({
            data: {
                name: data.name,
                date: new Date(data.date),
                fromday: data.fromday ? new Date(data.fromday) : null,
                toDay: data.toDay ? new Date(data.toDay) : null,
                description: data.description,
                schoolId: data.schoolId,
            }
        });
    }

    static async getHolidays(schoolId: string) {
        return prisma.holiday.findMany({
            where: { schoolId },
            orderBy: { date: 'asc' }
        });
    }

    static async getHolidayById(id: string) {
        return prisma.holiday.findUnique({
            where: { id }
        });
    }

    static async updateHoliday(id: string, data: any) {
        return prisma.holiday.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
                fromday: data.fromday ? new Date(data.fromday) : undefined,
                toDay: data.toDay ? new Date(data.toDay) : undefined,
            }
        });
    }

    static async deleteHoliday(id: string) {
        return prisma.holiday.delete({
            where: { id }
        });
    }
}
