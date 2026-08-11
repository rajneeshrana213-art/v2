import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { ParentService } from "@/lib/services/dashboard/parent-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    const { studentId } = req.method === "GET" ? req.query : req.body;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    // Security check: Verify parent has access to this student
    const children = await ParentService.getChildren(user.id);
    const student = children.find((c: any) => c.id === studentId);
    
    if (!student) {
      return res.status(403).json({ error: "Forbidden: You do not have access to this student's data" });
    }

    // Get the student's User record
    const studentRecord = await prisma.student.findUnique({
      where: { id: studentId as string },
      select: { userId: true }
    });

    if (!studentRecord) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (req.method === "GET") {
      const leaves = await prisma.leaveRequest.findMany({
        where: { userId: studentRecord.userId },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(leaves);
    }

    if (req.method === "POST") {
      const { fromDate, toDate, reason } = req.body;

      if (!fromDate || !toDate || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(fromDate);
      const end = new Date(toDate);

      if (start < today) {
        return res.status(400).json({ error: "From date cannot be in the past" });
      }
      if (end < start) {
        return res.status(400).json({ error: "To date cannot be before From date" });
      }

      const leave = await prisma.leaveRequest.create({
        data: {
          userId: studentRecord.userId,
          fromDate: start,
          toDate: end,
          reason,
          isApproved: "PENDING",
          status: "PENDING",
        },
      });
      return res.status(201).json(leave);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Parent Leave API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
