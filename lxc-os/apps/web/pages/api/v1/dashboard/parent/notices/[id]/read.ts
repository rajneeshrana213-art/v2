import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);
  const { id, studentId } = req.query;

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    // Verify parent owns the student
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      include: { students: { select: { id: true } } },
    });

    if (!parent)
      return res.status(404).json({ error: "Parent record not found" });

    if (!parent.students.some((s) => s.id === studentId)) {
      return res
        .status(403)
        .json({ error: "Forbidden: Student does not belong to parent" });
    }

    await prisma.noticeReadStatus.upsert({
      where: {
        noticeId_studentId: {
          noticeId: id as string,
          studentId: studentId as string,
        },
      },
      update: { readAt: new Date() },
      create: {
        noticeId: id as string,
        studentId: studentId as string,
      },
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[PARENT_NOTICE_READ_PATCH_ERROR]", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
