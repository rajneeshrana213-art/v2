import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../lib/prisma";
import { verifyAuth } from "../../../../../../lib/auth";
import { cors } from "../../../../../../lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const { classId } = req.query;

    if (!classId || typeof classId !== "string") {
      return res.status(400).json({ error: "Class ID is required" });
    }

    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        user: {
          select: {
            name: true,
            profilePic: true,
          },
        },
        academicRecords: {
          select: {
            rollNumber: true,
            academicYear: true,
          },
          orderBy: { academicYear: "desc" },
          take: 1,
        },
      },
    });

    // Format students to include top-level rollNo for frontend
    const formattedStudents = students.map(s => ({
      ...s,
      rollNo: s.academicRecords[0]?.rollNumber || ""
    }));

    // Sort by rollNo
    formattedStudents.sort((a, b) => {
      return (a.rollNo || "").localeCompare(b.rollNo || "", undefined, { numeric: true });
    });

    res.status(200).json(formattedStudents);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
