import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);
  const { id } = req.query;

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    await prisma.noticeReadStatus.upsert({
      where: {
        noticeId_studentId: {
          noticeId: id as string,
          studentId: student.id,
        },
      },
      update: { readAt: new Date() },
      create: {
        noticeId: id as string,
        studentId: student.id,
      },
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[NOTICE_READ_PATCH_ERROR]", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
