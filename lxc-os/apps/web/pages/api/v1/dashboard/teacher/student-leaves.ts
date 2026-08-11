import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;
  const user = (req as any).user;

  // Verify teacher
  const teacher = await prisma.teacher.findFirst({
    where: { userId: user.id },
    include: { classes: true },
  });

  if (!teacher) {
    return res.status(403).json({ error: "Access denied. Teacher only." });
  }

  if (req.method === "GET") {
    try {
      const classIds = teacher.classes.map((c) => c.id);

      const leaves = await prisma.leaveRequest.findMany({
        where: {
          user: {
            student: {
              classId: { in: classIds },
            },
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              student: {
                select: {
                  class: { select: { name: true } },
                  academicRecords: {
                    select: { rollNumber: true, academicYear: true },
                    orderBy: { academicYear: "desc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(leaves);
    } catch (error: any) {
      console.error("Student Leaves Fetch Error:", error);
      return res.status(500).json({ error: error.message, stack: error.stack });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { leaveId, status } = req.body;

      if (!leaveId || !["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({ error: "Invalid status or leaveId" });
      }

      // Check if leave request belongs to a student in teacher's classes
      const leaveRequest = await prisma.leaveRequest.findUnique({
        where: { id: leaveId },
        include: {
          user: {
            include: {
              student: true,
            },
          },
        },
      });

      if (!leaveRequest || !leaveRequest.user?.student?.classId) {
        return res
          .status(404)
          .json({ error: "Leave request or student not found." });
      }

      const isAuthorized = teacher.classes.some(
        (c) => c.id === leaveRequest.user?.student?.classId,
      );
      if (!isAuthorized) {
        return res
          .status(403)
          .json({ error: "Unauthorized. Student not in your classes." });
      }

      const updatedLeave = await prisma.leaveRequest.update({
        where: { id: leaveId },
        data: {
          isApproved: status,
          status: status,
        },
      });

      return res.status(200).json(updatedLeave);
    } catch (error: any) {
      console.error("Student Leaves Action Error:", error);
      return res.status(500).json({ error: error.message, stack: error.stack });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
