
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Exam ID is required" });
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { classId: true }
    });

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const students = await prisma.student.findMany({
      where: {
        classId: exam.classId,
        schoolId: user.schoolId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profilePic: true
          }
        },
        results: {
          where: { examId: id },
          select: {
            score: true,
            id: true
          }
        }
      },
      orderBy: {
        user: { name: "asc" }
      }
    });

    return res.status(200).json({
      success: true,
      data: students
    });
  } catch (error: any) {
    console.error("Fetch Students for Exam Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch students" });
  }
}
