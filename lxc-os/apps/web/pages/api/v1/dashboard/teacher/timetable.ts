
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    const teacher = await prisma.teacher.findFirst({
        where: { userId: user.id }
    });

    if (!teacher) {
        return res.status(404).json({ error: "Teacher record not found" });
    }

    const lessons = await prisma.lesson.findMany({
      where: { teacherId: teacher.id },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    // Group by day for easier frontend consumption
    const schedule: any = {
        MONDAY: [], TUESDAY: [], WEDNESDAY: [], THURSDAY: [], FRIDAY: [], SATURDAY: [], SUNDAY: []
    };

    lessons.forEach(l => {
        schedule[l.day].push({
            id: l.id,
            startTime: l.startTime,
            endTime: l.endTime,
            subject: l.subject?.name || "N/A",
            class: l.class.name,
            day: l.day
        });
    });

    res.status(200).json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
