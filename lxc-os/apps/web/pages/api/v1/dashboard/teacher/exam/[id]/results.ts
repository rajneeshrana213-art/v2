import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;
  const user = (req as any).user;

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Exam ID is required" });
  }

  // Verify teacher owns the class this exam belongs to
  const teacher = await prisma.teacher.findFirst({
    where: { userId: user.id },
    include: { classes: { select: { id: true } } },
  });
  if (!teacher) return res.status(404).json({ error: "Teacher record not found" });

  const exam = await prisma.exam.findFirst({
    where: {
      id,
      classId: { in: teacher.classes.map((c) => c.id) },
      isDeleted: false,
    },
    include: {
      class: { select: { name: true } },
      subject: { select: { name: true } },
    },
  });
  if (!exam) return res.status(404).json({ error: "Exam not found or access denied" });

  // ── GET – fetch students with existing results ───────────────────────────────
  if (req.method === "GET") {
    try {
      const students = await prisma.student.findMany({
        where: { classId: exam.classId },
        include: {
          user: { select: { name: true, profilePic: true } },
          academicRecords: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { rollNumber: true },
          },
          results: {
            where: { examId: id },
            select: { id: true, score: true },
          },
        },
        orderBy: { user: { name: "asc" } },
      });

      return res.status(200).json({ exam, students });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── POST – save / update results ────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const { results } = req.body;
      if (!results || !Array.isArray(results)) {
        return res.status(400).json({ error: "Results array is required" });
      }

      await prisma.$transaction(async (tx) => {
        for (const item of results) {
          const score = parseInt(item.score);
          if (isNaN(score)) continue;

          const existing = await tx.result.findFirst({
            where: { studentId: item.studentId, examId: id },
          });

          if (existing) {
            await tx.result.update({
              where: { id: existing.id },
              data: { score },
            });
          } else {
            await tx.result.create({
              data: { score, studentId: item.studentId, examId: id },
            });
          }
        }
      });

      return res.status(200).json({ message: "Results saved successfully" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
