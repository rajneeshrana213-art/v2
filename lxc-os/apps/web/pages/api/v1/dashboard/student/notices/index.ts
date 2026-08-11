import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

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
    const user = (req as any).user;

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true, schoolId: true },
    });

    if (!student) {
      return res.status(404).json({ error: "Student record not found" });
    }

    const notices = await prisma.notice.findMany({
      where: {
        schoolId: student.schoolId,
        recipients: {
          some: {
            userType: "STUDENT",
          },
        },
      },
      include: {
        creator: { select: { name: true } },
        readStatuses: {
          where: { studentId: student.id },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const transformedNotices = notices.map((notice) => ({
      ...notice,
      description: notice.message, // Map message to description for frontend
      isRead: notice.readStatuses.length > 0,
      readStatuses: undefined, // hide private relation data
    }));

    res.status(200).json(transformedNotices);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
