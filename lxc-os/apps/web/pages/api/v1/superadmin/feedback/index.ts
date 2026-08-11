
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [feedback, totalItems] = await Promise.all([
      prisma.feedback.findMany({
        include: {
          School: {
            select: {
              schoolName: true,
              schoolLogo: true,
              schoolCode: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.feedback.count(),
    ]);

    return res.status(200).json({
      feedback,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
