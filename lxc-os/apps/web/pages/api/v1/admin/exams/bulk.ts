
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  try {
    const { classId, exams } = req.body;

    if (!classId || !exams || !Array.isArray(exams) || exams.length === 0) {
      return res.status(400).json({ error: "Class ID and a non-empty list of exams are required" });
    }

    const createdExams = await prisma.exam.createMany({
      data: exams.map((exam: any) => ({
        title: exam.title,
        classId,
        subjectId: exam.subjectId,
        scheduleDate: new Date(exam.scheduleDate),
        startTime: new Date(exam.startTime || exam.scheduleDate),
        endTime: new Date(exam.endTime || exam.scheduleDate),
        passMark: exam.passMark ? parseInt(exam.passMark) : null,
        totalMarks: exam.totalMarks ? parseInt(exam.totalMarks) : null,
        duration: exam.duration ? parseInt(exam.duration) : null,
        roomNumber: exam.roomNumber ? parseInt(exam.roomNumber) : null,
        isPublished: false,
      })),
    });

    return res.status(201).json({
      success: true,
      message: `${createdExams.count} exams scheduled successfully`,
      data: createdExams,
    });
  } catch (error: any) {
    console.error("Bulk Create Exams Error:", error);
    return res.status(500).json({ error: error.message || "Failed to create exams in bulk" });
  }
}
