
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
        select: { id: true, schoolId: true }
    });

    if (!student) {
        return res.status(404).json({ error: "Student record not found" });
    }

    const fees = await StudentService.getFees(student.id, student.schoolId);
    
    res.status(200).json(fees);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
