import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "student") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { type } = req.query; // class or global

        if (type === "class") {
          if (!student.classId) {
            return res.status(400).json({ error: "Student does not belong to a class" });
          }
          const leaderboard = await prisma.classLeaderboard.findMany({
            where: { classId: student.classId },
            include: {
              student: {
                include: { user: { select: { name: true } } }
              }
            },
            orderBy: { academicScore: "desc" },
            take: 50
          });
          return res.status(200).json(leaderboard);
        }

        if (type === "global") {
          const leaderboard = await prisma.enhancementLeaderboard.findMany({
            where: { schoolId: student.schoolId },
            include: {
              student: {
                include: { user: { select: { name: true } } }
              }
            },
            orderBy: { enhancementScore: "desc" },
            take: 100
          });
          return res.status(200).json(leaderboard);
        }

        return res.status(400).json({ error: "Invalid type" });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
