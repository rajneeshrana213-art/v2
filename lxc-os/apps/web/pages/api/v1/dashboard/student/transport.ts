import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { StudentService } from "@/lib/services/dashboard/student-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userResult = await verifyAuth(req, res);
    if (!userResult) return;

    const student = await prisma.student.findUnique({
      where: { userId: userResult.id },
      select: { id: true },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const data = await StudentService.getTransportInfo(student.id);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
