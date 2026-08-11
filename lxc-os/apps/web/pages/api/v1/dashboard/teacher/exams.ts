import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

async function getTeacher(userId: string) {
  return prisma.teacher.findFirst({
    where: { userId },
    include: { classes: { select: { id: true } } },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;
  const user = (req as any).user;

  const teacher = await getTeacher(user.id);
  if (!teacher) return res.status(404).json({ error: "Teacher record not found" });

  const classIds = teacher.classes.map((c) => c.id);

  // ── GET – list all exams for teacher's classes ──────────────────────────────
  if (req.method === "GET") {
    try {
      const exams = await prisma.exam.findMany({
        where: { classId: { in: classIds }, isDeleted: false },
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true } },
          _count: { select: { results: true } },
        },
        orderBy: { scheduleDate: "desc" },
      });
      return res.status(200).json(exams);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── POST – create a new exam ────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const {
        title, classId, subjectId, scheduleDate,
        startTime, endTime, passMark, totalMarks, duration, roomNumber,
      } = req.body;

      if (!title || !classId || !subjectId || !scheduleDate) {
        return res.status(400).json({ error: "Title, Class, Subject, and Date are required" });
      }

      // Verify teacher is assigned to this class
      if (!classIds.includes(classId)) {
        return res.status(403).json({ error: "You are not assigned to this class" });
      }

      const exam = await prisma.exam.create({
        data: {
          title,
          classId,
          subjectId,
          scheduleDate: new Date(scheduleDate),
          startTime: startTime ? new Date(startTime) : new Date(scheduleDate),
          endTime: endTime ? new Date(endTime) : new Date(scheduleDate),
          passMark: passMark ? parseInt(passMark) : null,
          totalMarks: totalMarks ? parseInt(totalMarks) : 100,
          duration: duration ? parseInt(duration) : null,
          roomNumber: roomNumber ? parseInt(roomNumber) : null,
          isPublished: false,
        },
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true } },
          _count: { select: { results: true } },
        },
      });

      return res.status(201).json(exam);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── PATCH – update or toggle publish ────────────────────────────────────────
  if (req.method === "PATCH") {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Exam ID is required" });
      }

      const exam = await prisma.exam.findFirst({
        where: { id, classId: { in: classIds }, isDeleted: false },
      });
      if (!exam) return res.status(404).json({ error: "Exam not found or access denied" });

      const { publish, ...updateFields } = req.body;

      const data: any = {};
      if (typeof publish === "boolean") data.isPublished = publish;
      if (updateFields.title) data.title = updateFields.title;
      if (updateFields.scheduleDate) data.scheduleDate = new Date(updateFields.scheduleDate);
      if (updateFields.startTime) data.startTime = new Date(updateFields.startTime);
      if (updateFields.endTime) data.endTime = new Date(updateFields.endTime);
      if (updateFields.passMark !== undefined) data.passMark = updateFields.passMark ? parseInt(updateFields.passMark) : null;
      if (updateFields.totalMarks !== undefined) data.totalMarks = parseInt(updateFields.totalMarks);
      if (updateFields.duration !== undefined) data.duration = updateFields.duration ? parseInt(updateFields.duration) : null;
      if (updateFields.roomNumber !== undefined) data.roomNumber = updateFields.roomNumber ? parseInt(updateFields.roomNumber) : null;

      const updated = await prisma.exam.update({
        where: { id },
        data,
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true } },
          _count: { select: { results: true } },
        },
      });

      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── DELETE – soft-delete an exam ────────────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Exam ID is required" });
      }

      const exam = await prisma.exam.findFirst({
        where: { id, classId: { in: classIds }, isDeleted: false },
      });
      if (!exam) return res.status(404).json({ error: "Exam not found or access denied" });

      await prisma.exam.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), deletedBy: user.id },
      });

      return res.status(200).json({ message: "Exam deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
