import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { classId: true },
    });

    if (!student || !student.classId) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get subjects based on the class the student is in
    // This assumes Lesson or Subject model links to Class.
    // In this schema, Subject is often related via Lesson or directly.
    const lessons = await prisma.lesson.findMany({
      where: { classId: student.classId },
      select: {
        subject: {
          select: { id: true, name: true },
        },
      },
    });

    const uniqueSubjects = Array.from(
      new Map(lessons.map((l) => [l.subject.id, l.subject])).values(),
    );

    res.status(200).json(uniqueSubjects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
