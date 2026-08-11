import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, schoolId, classId } = req.query;

  let finalSchoolId = schoolId as string | undefined;

  // Use default school if ID is missing or placeholder
  if (!finalSchoolId || finalSchoolId === "default-school-id") {
    const defaultSchool = await prisma.school.findFirst();
    if (defaultSchool) {
      finalSchoolId = defaultSchool.id;
    } else {
      // No school exists at all
      return res.json([]);
    }
  }

  try {
    if (type === "classes") {
      const classes = await prisma.class.findMany({
        where: { schoolId: finalSchoolId },
        orderBy: { name: "asc" },
      });
      return res.json(classes);
    }

    if (type === "students") {
      if (!classId || typeof classId !== "string")
        return res.status(400).json({ error: "Class ID required" });
      const students = await prisma.student.findMany({
        where: { classId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          academicRecords: {
            select: { rollNumber: true, academicYear: true },
            orderBy: { academicYear: "desc" },
            take: 1,
          },
        },
        orderBy: { user: { name: "asc" } },
      });
      // Map to simpler format
      return res.json(
        students.map((s) => ({
          userId: s.user.id,
          name: s.user.name,
          email: s.user.email,
          studentId: s.id,
          rollNo: s.academicRecords[0]?.rollNumber ?? null,
        })),
      );
    }

    if (type === "teachers") {
      const teachers = await prisma.teacher.findMany({
        where: { schoolId: finalSchoolId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { user: { name: "asc" } },
      });
      return res.json(
        teachers.map((t) => ({
          userId: t.user.id,
          name: t.user.name,
          email: t.user.email,
          teacherId: t.id,
        })),
      );
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
