
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
  const { method } = req;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Exam ID is required" });
  }

  switch (method) {
    case "GET":
      try {
        const exam = await prisma.exam.findFirst({
          where: {
            id,
            class: { schoolId: user.schoolId }
          },
          include: {
            class: { select: { name: true } },
            subject: { select: { name: true } }
          }
        });

        if (!exam) {
          return res.status(404).json({ error: "Exam not found" });
        }

        return res.status(200).json({ success: true, data: exam });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to fetch exam" });
      }

    case "PUT":
      try {
        const { 
          title, 
          startTime, 
          endTime, 
          classId, 
          subjectId, 
          passMark, 
          totalMarks, 
          duration, 
          roomNumber, 
          scheduleDate 
        } = req.body;

        const updatedExam = await prisma.exam.update({
          where: { id },
          data: {
            title,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined,
            classId,
            subjectId,
            passMark: passMark ? parseInt(passMark) : undefined,
            totalMarks: totalMarks ? parseInt(totalMarks) : undefined,
            duration: duration ? parseInt(duration) : undefined,
            roomNumber: roomNumber ? parseInt(roomNumber) : undefined,
            scheduleDate: scheduleDate ? new Date(scheduleDate) : undefined,
          },
        });

        return res.status(200).json({ success: true, data: updatedExam });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to update exam" });
      }

    case "DELETE":
      try {
        await prisma.exam.delete({
          where: { id },
        });

        return res.status(200).json({ success: true, message: "Exam deleted successfully" });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to delete exam" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
