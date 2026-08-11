import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import * as fcmTriggers from "@/lib/services/notification/fcm-trigger-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Exam ID is required" });
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { isPublished: true, classId: true }
    });

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: { isPublished: !exam.isPublished }
    });

    // 🔔 Notify students if results are declared (fire-and-forget)
    if (updatedExam.isPublished && updatedExam.classId) {
      fcmTriggers.notifyResultDeclared(updatedExam.classId, (updatedExam as any).title || "Exam", user.schoolId);
    }

    return res.status(200).json({
      success: true,
      data: updatedExam,
      message: `Exam results ${!exam.isPublished ? "declared" : "retracted"} successfully`
    });
  } catch (error: any) {
    console.error("Declare Exam Error:", error);
    return res.status(500).json({ error: error.message || "Failed to toggle exam status" });
  }
}
