
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { createLessonSchema, bulkCreateLessonSchema } from "@/lib/validations/admin/educational";
import { getISTDateString, getISTHours, getISTMinutes, makeISTDateTime } from "@/lib/utils/date-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  if (req.method === "GET") {
    try {
      const { classId, sectionId, day } = req.query;

      if (!classId) {
        return res.status(400).json({ error: "classId is required" });
      }

      const lessons = await prisma.lesson.findMany({
        where: {
          classId: classId as string,
          ...(sectionId ? {
            OR: [
              { sectionId: sectionId as string },
              { sectionId: null }
            ]
          } : {}),
          ...(day && { day: day as any }),
          class: {
            schoolId: user.schoolId as string,
          },
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          teacher: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          section: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { day: "asc" },
          { startTime: "asc" },
        ],
      });

      return res.status(200).json(lessons);
    } catch (error: any) {
      console.error("Fetch Timetable Error:", error);
      return res.status(500).json({ error: "Failed to fetch timetable" });
    }
  }

  if (req.method === "POST") {
    try {
      const isBulk = Array.isArray(req.body.lessons);
      const validatedData: any = isBulk 
        ? bulkCreateLessonSchema.parse(req.body)
        : createLessonSchema.parse(req.body);

      const classIds = isBulk 
        ? (validatedData as z.infer<typeof bulkCreateLessonSchema>).classIds 
        : (validatedData.classIds || (validatedData.classId ? [validatedData.classId] : []));

      if (classIds.length === 0) {
        return res.status(400).json({ error: "At least one classId is required" });
      }

      // Fetch School Config for validation
      const school = await prisma.school.findUnique({
        where: { id: user.schoolId as string },
        select: {
          schoolOpening: true,
          schoolClosing: true,
          lunchStart: true,
          lunchEnd: true,
          periodDuration: true
        }
      });

      if (!school) {
        return res.status(404).json({ error: "School configuration not found" });
      }

      // Helper for time comparison (returns minutes from midnight)
      const toMinutes = (timeStr: string | Date) => {
        if (timeStr instanceof Date) {
          return getISTHours(timeStr) * 60 + getISTMinutes(timeStr);
        }
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
      };

      const openingMins = toMinutes(school.schoolOpening || "08:00");
      const closingMins = toMinutes(school.schoolClosing || "16:00");
      const lunchStartMins = toMinutes(school.lunchStart || "12:00");
      const lunchEndMins = toMinutes(school.lunchEnd || "13:00");
      const maxDuration = school.periodDuration || 45;

      const results = await prisma.$transaction(async (tx) => {
        const createdLessons = [];

        for (const classId of classIds) {
          // Verify class belongs to school
          const targetClass = await tx.class.findFirst({
            where: { id: classId, schoolId: user.schoolId as string },
          });

          if (!targetClass) continue;

          const lessonsToCreate = isBulk 
            ? (validatedData as z.infer<typeof bulkCreateLessonSchema>).lessons
            : [{
                day: (validatedData as any).day,
                startTime: (validatedData as any).startTime,
                endTime: (validatedData as any).endTime,
                subjectId: (validatedData as any).subjectId,
                teacherId: (validatedData as any).teacherId
              }];

          for (const slot of lessonsToCreate) {
            // Handle timing: HH:mm conversion or ISO string
            // IMPORTANT: `toISOString().split("T")[0]` is UTC and breaks in IST on Vercel.
            // Build times on an IST calendar date with +05:30 so the stored UTC instant is correct.
            const todayIST = getISTDateString();
            const startTime =
              typeof slot.startTime === "string" && slot.startTime.includes(":")
                ? makeISTDateTime(todayIST, slot.startTime)
                : new Date(slot.startTime as any);
            const endTime =
              typeof slot.endTime === "string" && slot.endTime.includes(":")
                ? makeISTDateTime(todayIST, slot.endTime)
                : new Date(slot.endTime as any);

            const startMins = toMinutes(startTime);
            const endMins = toMinutes(endTime);
            const duration = endMins - startMins;

            // 1. Duration Check
            if (duration > maxDuration) {
              throw new Error(`Lecture duration (${duration}m) exceeds school standard of ${maxDuration}m.`);
            }

            // 2. School Hours Check
            if (startMins < openingMins || endMins > closingMins) {
              throw new Error(`Lesson at ${slot.startTime}-${slot.endTime} is outside school hours (${school.schoolOpening}-${school.schoolClosing}).`);
            }

            // 3. Lunch Break Check
            if (startMins < lunchEndMins && endMins > lunchStartMins) {
              throw new Error(`Lessons cannot be scheduled during lunch break (${school.lunchStart}-${school.lunchEnd}). Slot requested: ${slot.startTime}-${slot.endTime}.`);
            }

            // 4. Teacher Conflict Check
            if (slot.teacherId) {
              const overlappingLesson = await tx.lesson.findFirst({
                where: {
                  teacherId: slot.teacherId,
                  day: slot.day as any,
                  startTime: { lt: endTime },
                  endTime: { gt: startTime },
                },
                include: {
                  class: { select: { name: true } },
                  section: { select: { name: true } },
                }
              });

              if (overlappingLesson) {
                const className = overlappingLesson.class.name;
                const sectionName = overlappingLesson.section ? ` - ${overlappingLesson.section.name}` : "";
                throw new Error(`Teacher is already scheduled for a class in ${className}${sectionName} at this time.`);
              }
            }

            // Get reference subject code
            const refSubject = await tx.subject.findUnique({
              where: { id: slot.subjectId },
              select: { code: true, name: true }
            });

            if (!refSubject) continue;

            // Find the corresponding subject in this class by code (preferred) or name
            const targetSubject = await tx.subject.findFirst({
              where: {
                classId: classId,
                OR: [{ code: refSubject.code }, { name: refSubject.name }]
              }
            });

            if (!targetSubject) continue;

            // Handle sectionId
            let sectionId = validatedData.sectionId;
            if (sectionId) {
              const targetSection = await tx.section.findFirst({
                where: { id: sectionId, classId: classId },
              });
              if (!targetSection) sectionId = null;
            }

            const lesson = await tx.lesson.create({
              data: {
                day: slot.day as any,
                startTime,
                endTime,
                subjectId: targetSubject.id,
                classId: classId,
                sectionId: sectionId as string | null,
                teacherId: slot.teacherId,
              },
              include: {
                subject: true,
                teacher: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
                section: true,
              },
            });
            createdLessons.push(lesson);
          }
        }
        return createdLessons;
      }, {
        maxWait: 10000, // 10 seconds max wait for connection
        timeout: 30000  // 30 seconds max execution time
      });

      return res.status(201).json(results);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      console.error("Create Lesson Error:", error);
      return res.status(400).json({ error: error.message || "Failed to create lessons" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
