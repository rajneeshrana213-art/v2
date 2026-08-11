import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

/**
 * Alumni API
 * GET  - List alumni/transferred/dropped-out students for the school
 * PATCH - Update a student's lifecycle status
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);
  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  let schoolId: string | null = user?.schoolId || null;

  // Fallback: resolve schoolId from DB if session doesn't carry it
  if (!schoolId && user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { schoolId: true },
    });
    schoolId = dbUser?.schoolId || null;
  }

  if (!schoolId) {
    return res
      .status(400)
      .json({ error: "User is not associated with a school" });
  }

  if (req.method === "GET") {
    return handleGet(req, res, schoolId);
  }
  if (req.method === "PATCH") {
    return handlePatch(req, res, schoolId);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  schoolId: string,
) {
  try {
    const { status, search, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const allowedStatuses = ["ALUMNI", "TRANSFERRED", "DROPPED_OUT"];
    const statusFilter =
      status && allowedStatuses.includes(status as string)
        ? [status as string]
        : allowedStatuses;

    const baseWhere: any = {
      schoolId,
      isDeleted: false,
      status: { in: statusFilter as any },
    };
    if (search) {
      baseWhere.user = {
        name: { contains: search as string, mode: "insensitive" },
      };
    }

    const statsWhere: any = {
      schoolId,
      isDeleted: false,
      status: { in: allowedStatuses as any },
    };

    const [students, total, statusCounts] = await Promise.all([
      prisma.student.findMany({
        where: baseWhere,
        skip,
        take: limitNum,
        include: {
          user: {
            select: { name: true, email: true, profilePic: true },
          },
          class: { select: { name: true } },
          academicRecords: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              section: { select: { name: true } },
            },
          },
          StudentPromotion: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.student.count({ where: baseWhere }),
      prisma.student.groupBy({
        by: ["status"],
        where: statsWhere,
        _count: { _all: true },
      }),
    ]);

    const stats: Record<string, number> = {
      total: 0,
      ALUMNI: 0,
      TRANSFERRED: 0,
      DROPPED_OUT: 0,
    };
    for (const item of statusCounts) {
      const s = item.status as string;
      stats[s] = item._count._all;
      stats.total += item._count._all;
    }

    return res.status(200).json({
      success: true,
      data: students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      stats,
    });
  } catch (error: any) {
    console.error("Alumni GET error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse,
  schoolId: string,
) {
  try {
    const { studentId, status } = req.body;

    const allowedStatuses = ["ALUMNI", "TRANSFERRED", "DROPPED_OUT", "ACTIVE"];
    if (!studentId || !status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error:
          "studentId and a valid status (ALUMNI | TRANSFERRED | DROPPED_OUT | ACTIVE) are required",
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId, schoolId },
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { status },
      include: {
        user: { select: { name: true, email: true, profilePic: true } },
        class: { select: { name: true } },
      },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Alumni PATCH error:", error);
    return res.status(500).json({ error: error.message });
  }
}
