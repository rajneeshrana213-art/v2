
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

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { classId, subjectId } = req.query;

        const where: any = {
          class: {
            schoolId: user.schoolId
          }
        };

        if (classId) {
          where.classId = classId as string;
        }

        if (subjectId) {
          where.subjectId = subjectId as string;
        }

        const exams = await prisma.exam.findMany({
          where,
          include: {
            class: {
              select: {
                name: true,
              },
            },
            subject: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                results: true,
              },
            },
          },
          orderBy: {
            scheduleDate: "desc",
          },
        });

        return res.status(200).json({
          success: true,
          data: exams,
        });
      } catch (error: any) {
        console.error("Fetch Exams Error:", error);
        return res.status(500).json({ error: error.message || "Failed to fetch exams" });
      }

    case "POST":
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

        if (!title || !classId || !subjectId || !scheduleDate) {
          return res.status(400).json({ error: "Title, Class, Subject, and Schedule Date are required" });
        }

        const exam = await prisma.exam.create({
          data: {
            title,
            startTime: new Date(startTime || scheduleDate),
            endTime: new Date(endTime || scheduleDate),
            classId,
            subjectId,
            passMark: passMark ? parseInt(passMark) : null,
            totalMarks: totalMarks ? parseInt(totalMarks) : null,
            duration: duration ? parseInt(duration) : null,
            roomNumber: roomNumber ? parseInt(roomNumber) : null,
            scheduleDate: new Date(scheduleDate),
            isPublished: false,
          },
        });

        return res.status(201).json({
          success: true,
          message: "Exam created successfully",
          data: exam,
        });
      } catch (error: any) {
        console.error("Create Exam Error:", error);
        return res.status(500).json({ error: error.message || "Failed to create exam" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
