
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    const teacher = await prisma.teacher.findFirst({
        where: { userId: user.id }
    });

    if (!teacher) {
        return res.status(404).json({ error: "Teacher record not found" });
    }

    const notices = await prisma.notice.findMany({
      where: {
        schoolId: teacher.schoolId,
        recipients: {
          some: {
            userType: "TEACHER"
          }
        }
      },
      include: {
        creator: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const transformedNotices = notices.map((notice) => ({
      ...notice,
      description: notice.message, // Map message to description for frontend
    }));

    res.status(200).json(transformedNotices);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
