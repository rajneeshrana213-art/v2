
import { NextApiRequest, NextApiResponse } from "next";
import { StudentService } from "../../../../../lib/services/dashboard/student-service";
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

    const student = await prisma.student.findUnique({
        where: { userId: user.id },
        select: { id: true, classId: true }
    });

    if (!student) {
        return res.status(404).json({ error: "Student record not found" });
    }

    if (!student.classId) {
        return res.status(400).json({ error: "Student class ID not found" });
    }

    const homework = await StudentService.getAssignments(student.id, student.classId);
    
    res.status(200).json({
      homework,
      studentId: student.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
