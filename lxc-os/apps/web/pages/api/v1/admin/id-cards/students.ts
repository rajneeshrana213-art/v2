import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;
  const user = (req as any).user;

  if (!user.schoolId) return res.status(400).json({ error: "No school associated" });

  const { classId } = req.query;

  try {
    const where: any = { schoolId: user.schoolId, isDeleted: false };
    if (classId) where.classId = classId as string;

    const activeYear = await prisma.academicYear.findFirst({
      where: { schoolId: user.schoolId, isActive: true },
      select: { year: true }
    });

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { name: true, userName: true, profilePic: true, phone: true, email: true, address: true, city: true } },
        class: { select: { name: true } },
        school: { select: { schoolName: true, schoolLogo: true } },
        academicRecords: { orderBy: { createdAt: "desc" }, take: 1, select: { rollNumber: true } },
      },
      orderBy: { user: { name: "asc" } },
    });

    const enrichedStudents = students.map(s => ({
      ...s,
      activeYear: activeYear?.year || "2024-25"
    }));

    return res.status(200).json(enrichedStudents);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
