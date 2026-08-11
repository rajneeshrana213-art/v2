import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    if (req.method === "GET") {
      const { search, classId } = req.query;

      const students = await prisma.student.findMany({
        where: {
          schoolId: user.schoolId,
          ...(classId ? { classId: classId as string } : {}),
          ...(search
            ? {
                OR: [
                  {
                    user: {
                      name: { contains: search as string, mode: "insensitive" },
                    },
                  },
                  {
                    academicRecords: {
                      some: {
                        rollNumber: {
                          contains: search as string,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                ],
              }
            : {}),
        },
        include: {
          user: true,
          buses: true,
          route: true,
          class: true,
        },
        take: 100,
      });
      return res.status(200).json(students);
    }

    if (req.method === "POST") {
      const { studentIds, busId, routeId } = req.body;

      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ error: "No students selected" });
      }

      const updated = await prisma.student.updateMany({
        where: {
          id: { in: studentIds },
          schoolId: user.schoolId,
        },
        data: {
          busId: busId || null,
          routeId: routeId || null,
        },
      });

      return res.status(200).json({ count: updated.count });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("[ASSIGNMENT_API_ERROR]", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
