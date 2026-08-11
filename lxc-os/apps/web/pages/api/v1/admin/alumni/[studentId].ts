import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { StudentLifecycleStatus } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";

/**
 * Alumni Detail API
 * GET - Get full alumni profile with complete academic history
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { studentId } = req.query;

    if (!studentId || typeof studentId !== "string") {
      return res.status(400).json({ error: "studentId is required" });
    }

    const student = await (prisma as any).student.findFirst({
      where: {
        id: studentId,
        status: StudentLifecycleStatus.ALUMNI,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePic: true,
            city: true,
            state: true,
            country: true,
          },
        },
        school: {
          select: {
            id: true,
            schoolName: true,
            schoolLogo: true,
          },
        },
        academicRecords: {
          orderBy: { academicYear: "asc" },
          include: {
            class: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Alumni not found" });
    }

    // Derive batch info
    const lastRecord =
      student.academicRecords[student.academicRecords.length - 1];

    return res.status(200).json({
      alumni: {
        ...student,
        batch: lastRecord?.academicYear || "Unknown",
        lastClass: lastRecord?.class?.name || "Unknown",
      },
    });
  } catch (error: any) {
    console.error("Alumni detail error:", error);
    return res.status(500).json({ error: error.message });
  }
}
