
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../lib/prisma";
import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "../../../../../../lib/middleware/cors";
import { getInstitutionalToday, getInstitutionalEndOfDay } from "../../../../../../lib/utils/date-utils";


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
        where: { userId: user.id },
        include: {
            classes: {
                select: {
                    id: true,
                    name: true,
                    Section: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    });

    if (!teacher) {
        return res.status(404).json({ error: "Teacher record not found" });
    }

    // For each class, check if attendance is marked for today (IST)
    const today    = getInstitutionalToday();
    const todayEnd = getInstitutionalEndOfDay();

    const classesWithStatus = await Promise.all(teacher.classes.map(async (cls) => {
        const attendanceCount = await prisma.attendance.count({
            where: {
                lesson: { classId: cls.id, teacherId: teacher.id },
                date: {
                    gte: today,
                    lte: todayEnd
                }
            }
        });

        return {
            ...cls,
            isMarked: attendanceCount > 0
        };
    }));

    res.status(200).json(classesWithStatus);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
