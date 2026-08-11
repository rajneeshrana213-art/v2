import { prisma } from "../../prisma";

export const DraftTimetable = {
    async create(payload: any) {
        return prisma.timetableDraft.create({
            data: {
                payload,
            },
        });
    },

    async get(id: string) {
        return prisma.timetableDraft.findUnique({
            where: {
                id,
            },
        });
    },

    async remove(id: string) {
        return prisma.timetableDraft.delete({
            where: {
                id,
            },
        });
    },
};
