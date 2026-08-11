
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { z } from "zod";

const copyTimetableSchema = z.object({
  fromClassId: z.string().cuid(),
  fromSectionId: z.string().cuid().nullable().optional(),
  toClassId: z.string().cuid(),
  toSectionId: z.string().cuid().nullable().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;

  if (req.method === "POST") {
    try {
      const { fromClassId, fromSectionId, toClassId, toSectionId } = copyTimetableSchema.parse(req.body);

      // Simple cycle detection: can't copy to itself
      if (fromClassId === toClassId && fromSectionId === toSectionId) {
        return res.status(400).json({ error: "Source and destination cannot be the same" });
      }

      // Verify both classes belong to the school
      const classes = await prisma.class.findMany({
        where: {
          id: { in: [fromClassId, toClassId] },
          schoolId: user.schoolId as string,
        },
      });

      if (classes.length < (fromClassId === toClassId ? 1 : 2)) {
        return res.status(404).json({ error: "One or more classes not found" });
      }

      // Fetch lessons from source
      const sourceLessons = await prisma.lesson.findMany({
        where: {
          classId: fromClassId,
          sectionId: fromSectionId || null,
        },
      });

      if (sourceLessons.length === 0) {
        return res.status(400).json({ error: "Source timetable is empty" });
      }

      // Transaction to clear destination and copy
      await prisma.$transaction(async (tx) => {
        // Option A: Always overwrite? Yes, for copy functionality
        await tx.lesson.deleteMany({
          where: {
            classId: toClassId,
            sectionId: toSectionId || null,
          },
        });

        // Map and create new lessons
        const newLessons = sourceLessons.map(lesson => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, classId, sectionId, ...rest } = lesson;
          return {
            ...rest,
            classId: toClassId,
            sectionId: toSectionId || null,
          };
        });

        // Validate teacher conflicts for the new lessons
        for (const lesson of newLessons) {
          if (lesson.teacherId) {
            const overlappingLesson = await tx.lesson.findFirst({
              where: {
                teacherId: lesson.teacherId,
                day: lesson.day,
                startTime: { lt: lesson.endTime },
                endTime: { gt: lesson.startTime },
                // Exclude the destination class/section since we are overwriting it
                NOT: {
                  classId: toClassId,
                  sectionId: toSectionId || null
                }
              },
              include: {
                class: { select: { name: true } },
                section: { select: { name: true } },
                teacher: { include: { user: { select: { name: true } } } }
              }
            });

            if (overlappingLesson) {
              const teacherName = overlappingLesson.teacher?.user?.name || 'Teacher';
              const className = overlappingLesson.class.name;
              const sectionName = overlappingLesson.section ? ` - ${overlappingLesson.section.name}` : "";
              throw new Error(`Cannot copy timetable: ${teacherName} is already scheduled for a class in ${className}${sectionName} on ${lesson.day} at ${lesson.startTime.toLocaleTimeString()}-${lesson.endTime.toLocaleTimeString()}.`);
            }
          }
        }

        await tx.lesson.createMany({
          data: newLessons,
        });
      });

      return res.status(200).json({ message: `Successfully copied ${sourceLessons.length} lessons` });
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      console.error("Copy Timetable Error:", error);
      return res.status(500).json({ error: "Failed to copy timetable" });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
