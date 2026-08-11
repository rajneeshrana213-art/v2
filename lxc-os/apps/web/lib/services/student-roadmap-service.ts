import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";
import { z } from "zod";

// Validations
export const createRoadmapSchema = z.object({
  userId: z.string().cuid(),
  subjectId: z.string().cuid(),
  durationDays: z.number().int().positive(),
  title: z.string().optional(),
});

export const updateRoadmapSchema = z.object({
  title: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  coinsEarned: z.number().int().nonnegative().optional(),
});

// Services
export const createRoadmap = async (data: { userId: string; subjectId: string; durationDays: number; title?: string }) => {
    const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
    if (!subject) throw new Error("Subject not found");

    const startDate = new Date();
    const endDate = addDays(startDate, data.durationDays);

    const roadmap = await prisma.roadmap.create({
        data: {
            title: data.title || `${subject.name} Roadmap`,
            userId: data.userId,
            subjectId: data.subjectId,
            startDate,
            endDate
        }
    });

    const topicsData = Array.from({ length: data.durationDays }, (_, i) => ({
        name: `Topic ${i + 1}`,
        roadmapId: roadmap.id
    }));

    await prisma.topic.createMany({ data: topicsData });

    return await prisma.roadmap.findUnique({
        where: { id: roadmap.id },
        include: { topics: true }
    });
};

export const getAllRoadmaps = async () => {
    return await prisma.roadmap.findMany({ include: { topics: true } });
};

export const getRoadmapById = async (id: string) => {
    return await prisma.roadmap.findUnique({
        where: { id },
        include: { topics: true }
    });
};

export const updateRoadmap = async (id: string, data: { title?: string; progress?: number; coinsEarned?: number }) => {
    return await prisma.roadmap.update({
        where: { id },
        data
    });
};

export const deleteRoadmap = async (id: string) => {
    return await prisma.roadmap.delete({ where: { id } });
};
