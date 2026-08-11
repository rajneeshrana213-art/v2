import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { getPYQsByClassAndSubject } from "@/lib/services/teacher/PYQService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;

  // Find student record to get classId
  const student = await prisma.student.findFirst({
    where: { userId: user.id },
    select: { classId: true },
  });

  if (!student || !student.classId) {
    return res.status(404).json({ error: "Student record not found" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { subjectId } = req.query;
        const pyqs = await getPYQsByClassAndSubject(
          student.classId,
          subjectId as string,
        );
        return res.status(200).json(pyqs);
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: error.message || "Failed to fetch PYQs" });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
