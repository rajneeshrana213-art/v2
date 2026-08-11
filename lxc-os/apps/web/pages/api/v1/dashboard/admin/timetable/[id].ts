
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { updateLessonSchema } from "@/lib/validations/admin/educational";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Lesson ID is required" });
  }

  // Verify ownership
  const existingLesson = await prisma.lesson.findFirst({
    where: {
      id: id,
      class: {
        schoolId: user.schoolId as string,
      },
    },
  });

  if (!existingLesson) {
    return res.status(404).json({ error: "Lesson not found or access denied" });
  }

  if (req.method === "PUT") {
    try {
      const validatedData = updateLessonSchema.parse(req.body);

      const day = validatedData.day || existingLesson.day;
      const startTime = validatedData.startTime ? new Date(validatedData.startTime) : existingLesson.startTime;
      const endTime = validatedData.endTime ? new Date(validatedData.endTime) : existingLesson.endTime;
      
      let teacherId = existingLesson.teacherId;
      if ('teacherId' in validatedData) {
        teacherId = validatedData.teacherId as string | null;
      }

      if (teacherId) {
        const overlappingLesson = await prisma.lesson.findFirst({
          where: {
            teacherId: teacherId,
            day: day as any,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            id: { not: id as string }
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
          return res.status(400).json({ error: `${teacherName} is already scheduled for a class in ${className}${sectionName} at this time.` });
        }
      }

      const lesson = await prisma.lesson.update({
        where: { id },
        data: {
          ...(validatedData.day && { day: validatedData.day as any }),
          ...(validatedData.startTime && { startTime: new Date(validatedData.startTime) }),
          ...(validatedData.endTime && { endTime: new Date(validatedData.endTime) }),
          ...(validatedData.subjectId && { subjectId: validatedData.subjectId }),
          ...(validatedData.teacherId && { teacherId: validatedData.teacherId }),
          ...(validatedData.sectionId && { sectionId: validatedData.sectionId }),
        },
        include: {
          subject: true,
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          section: true,
        },
      });

      return res.status(200).json(lesson);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      console.error("Update Lesson Error:", error);
      return res.status(500).json({ error: "Failed to update lesson" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.lesson.delete({
        where: { id },
      });
      return res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (error: any) {
      console.error("Delete Lesson Error:", error);
      return res.status(500).json({ error: "Failed to delete lesson" });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
