import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { StudentLifecycleStatus } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";

/**
 * Student Lifecycle API
 * GET  - Get lifecycle report/stats for a school
 * PATCH - Update a single student's lifecycle status (transfer, dropout, graduate)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    return handleGet(req, res);
  }
  if (req.method === "PATCH") {
    return handlePatch(req, res);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

/**
 * GET /api/v1/admin/student-lifecycle?schoolId=...&academicYear=...
 * Returns lifecycle statistics for a school in a given academic year
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId) {
      return res.status(400).json({ error: "schoolId is required" });
    }

    // Get counts by status
    const [active, alumni, transferred, droppedOut] = await Promise.all([
      (prisma as any).student.count({
        where: {
          schoolId: schoolId as string,
          status: StudentLifecycleStatus.ACTIVE,
          isDeleted: false,
        },
      }),
      (prisma as any).student.count({
        where: {
          schoolId: schoolId as string,
          status: StudentLifecycleStatus.ALUMNI,
          isDeleted: false,
        },
      }),
      (prisma as any).student.count({
        where: {
          schoolId: schoolId as string,
          status: StudentLifecycleStatus.TRANSFERRED,
          isDeleted: false,
        },
      }),
      (prisma as any).student.count({
        where: {
          schoolId: schoolId as string,
          status: StudentLifecycleStatus.DROPPED_OUT,
          isDeleted: false,
        },
      }),
    ]);

    // If academicYear is supplied, also grab promotion stats
    let promotionStats = null;
    if (academicYear) {
      const [
        promoted,
        repeated,
        graduatedCount,
        transferredCount,
        droppedOutCount,
      ] = await Promise.all([
        (prisma as any).studentAcademicRecord.count({
          where: {
            academicYear: academicYear as string,
            promotionStatus: "PROMOTED",
            student: { schoolId: schoolId as string, isDeleted: false },
            isDeleted: false,
          },
        }),
        (prisma as any).studentAcademicRecord.count({
          where: {
            academicYear: academicYear as string,
            promotionStatus: "REPEATED",
            student: { schoolId: schoolId as string, isDeleted: false },
            isDeleted: false,
          },
        }),
        (prisma as any).studentAcademicRecord.count({
          where: {
            academicYear: academicYear as string,
            promotionStatus: "GRADUATED",
            student: { schoolId: schoolId as string, isDeleted: false },
            isDeleted: false,
          },
        }),
        (prisma as any).studentAcademicRecord.count({
          where: {
            academicYear: academicYear as string,
            promotionStatus: "TRANSFERRED",
            student: { schoolId: schoolId as string, isDeleted: false },
            isDeleted: false,
          },
        }),
        (prisma as any).studentAcademicRecord.count({
          where: {
            academicYear: academicYear as string,
            promotionStatus: "DROPPED_OUT",
            student: { schoolId: schoolId as string, isDeleted: false },
            isDeleted: false,
          },
        }),
      ]);

      promotionStats = {
        promoted,
        repeated,
        graduated: graduatedCount,
        transferred: transferredCount,
        droppedOut: droppedOutCount,
      };
    }

    return res.status(200).json({
      overall: {
        active,
        alumni,
        transferred,
        droppedOut,
        total: active + alumni + transferred + droppedOut,
      },
      promotionStats,
    });
  } catch (error: any) {
    console.error("Student lifecycle GET error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * PATCH /api/v1/admin/student-lifecycle
 * Body: {
 *   studentId: string,
 *   status: "TRANSFERRED" | "DROPPED_OUT" | "ALUMNI",
 *   remarks?: string
 * }
 * Updates a single student's lifecycle status with optional remarks on their last academic record.
 */
async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { studentId, status, remarks } = req.body;

    if (!studentId || !status) {
      return res
        .status(400)
        .json({ error: "studentId and status are required" });
    }

    const validStatuses = ["TRANSFERRED", "DROPPED_OUT", "ALUMNI"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Update student status
    const updatedStudent = await (prisma as any).student.update({
      where: { id: studentId },
      data: {
        status: status as StudentLifecycleStatus,
      },
    });

    // Add remarks to the latest academic record if provided
    if (remarks) {
      const latestRecord = await (
        prisma as any
      ).studentAcademicRecord.findFirst({
        where: { studentId },
        orderBy: { createdAt: "desc" },
      });

      if (latestRecord) {
        const promotionMap: Record<string, string> = {
          TRANSFERRED: "TRANSFERRED",
          DROPPED_OUT: "DROPPED_OUT",
          ALUMNI: "GRADUATED",
        };

        await (prisma as any).studentAcademicRecord.update({
          where: { id: latestRecord.id },
          data: {
            remarks,
            promotionStatus: promotionMap[status],
          },
        });
      }
    }

    return res.status(200).json({
      message: `Student status updated to ${status}`,
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("Student lifecycle PATCH error:", error);
    return res.status(500).json({ error: error.message });
  }
}
