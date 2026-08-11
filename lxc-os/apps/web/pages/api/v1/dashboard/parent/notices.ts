import { NextApiRequest, NextApiResponse } from "next";
import { ParentService } from "../../../../../lib/services/dashboard/parent-service";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";
import { prisma } from "../../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { studentId } = req.query;

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    let schoolId: string | undefined;

    if (studentId) {
      const studentRecord = await prisma.student.findUnique({
        where: { id: studentId as string },
        select: { schoolId: true }
      });
      schoolId = studentRecord?.schoolId;
    }

    if (!schoolId) {
      const children = await ParentService.getChildren(user.id);
      if (children.length > 0) {
        const studentRecord = await prisma.student.findUnique({
          where: { id: children[0].id },
          select: { schoolId: true }
        });
        schoolId = studentRecord?.schoolId;
      }
    }

    if (!schoolId && user.schoolId) {
      schoolId = user.schoolId;
    }

    if (!schoolId) {
      return res.status(404).json({ error: "School identification failed" });
    }

    const notices = await ParentService.getEvents(schoolId);
    return res.status(200).json(notices.notices);
  } catch (error: any) {
    console.error("[PARENT_NOTICES_ERROR]", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
