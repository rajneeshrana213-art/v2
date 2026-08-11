import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { studentFeePlanId, status } = req.query;

  try {
    const where: any = {
      schoolId: user.schoolId,
    };

    if (studentFeePlanId) {
      where.studentFeePlanId = studentFeePlanId;
    }

    if (status) {
      where.status = status;
    }

    const concessions = await prisma.concession.findMany({
      where,
      include: {
        studentFeePlan: {
          include: {
            student: {
              include: {
                user: { select: { name: true } },
                class: { select: { name: true } },
              },
            },
          },
        },
        feeHead: {
          select: { name: true },
        },
        approver: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(concessions);
  } catch (error: any) {
    console.error("Get Concessions Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
