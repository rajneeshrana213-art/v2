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

  try {
    const activeYear = await prisma.academicYear.findFirst({
      where: { schoolId: user.schoolId, isActive: true },
      select: { year: true }
    });

    const teachers = await prisma.teacher.findMany({
      where: { schoolId: user.schoolId, isDeleted: false },
      include: {
        user: { select: { name: true, userName: true, profilePic: true, phone: true, email: true, address: true, city: true } },
        school: { select: { schoolName: true, schoolLogo: true } },
        subjects: { select: { name: true }, take: 3 },
        classes: { select: { name: true }, take: 2 },
      },
      orderBy: { user: { name: "asc" } },
    });

    const enrichedTeachers = teachers.map(t => ({
      ...t,
      activeYear: activeYear?.year || "2024-25"
    }));

    return res.status(200).json(enrichedTeachers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
