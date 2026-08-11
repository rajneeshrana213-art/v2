import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import {
  createDoubtService,
  getDoubtsService,
  createDoubtReplyService,
} from "@/lib/services/common/DoubtService";
import { DoubtPriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "student") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const student = await prisma.student.findUnique({
          where: { userId: user.id },
        });
        if (!student)
          return res.status(404).json({ error: "Student not found" });

        const { subjectId, status, mine } = req.query;
        const doubts = await getDoubtsService({
          schoolId: user.schoolId,
          classId: student.classId ?? undefined,
          subjectId: subjectId as string,
          status: status as any,
          userId: mine === "true" ? user.id : undefined,
        });
        return res.status(200).json(doubts);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    case "POST":
      try {
        const { action } = req.body;
        const student = await prisma.student.findUnique({
          where: { userId: user.id },
        });
        if (!student)
          return res.status(404).json({ error: "Student not found" });

        if (action === "reply") {
          let { doubtId, content, file, fileName } = req.body;
          let attachmentUrl = undefined;

          if (file && file.startsWith("data:")) {
            const { uploadFile } = await import("@/lib/config/upload");
            const base64Data = file.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");
            const uploadResult = await uploadFile(
              buffer,
              `doubts/replies/${student.id}`,
              "auto",
              fileName || `reply_${Date.now()}`,
            );
            attachmentUrl = uploadResult.url;
          }

          const reply = await createDoubtReplyService({
            doubtId,
            userId: user.id,
            role: user.role,
            content,
            attachmentUrl: attachmentUrl || req.body.attachmentUrl,
          });
          return res.status(201).json(reply);
        }

        let {
          title,
          content,
          subjectId,
          chapter,
          difficulty,
          priority,
          file,
          fileName,
        } = req.body;
        let attachmentUrl = undefined;

        if (file && file.startsWith("data:")) {
          const { uploadFile } = await import("@/lib/config/upload");
          const base64Data = file.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");
          const uploadResult = await uploadFile(
            buffer,
            `doubts/${student.id}`,
            "auto",
            fileName || `doubt_${Date.now()}`,
          );
          attachmentUrl = uploadResult.url;
        }

        if (!student.classId) {
          return res
            .status(400)
            .json({ error: "Student is not assigned to a class" });
        }

        const doubt = await createDoubtService({
          title,
          content,
          classId: student.classId,
          subjectId,
          userId: user.id,
          chapter,
          difficulty,
          priority: priority as DoubtPriority,
          attachmentUrl,
        });
        return res.status(201).json(doubt);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
