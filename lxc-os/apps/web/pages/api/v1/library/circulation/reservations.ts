import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (
      !user ||
      (user.role !== "admin" &&
        user.role !== "superadmin" &&
        user.role !== "library")
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const libraryId = req.query.libraryId as string;
    if (!libraryId) {
      return res.status(400).json({ error: "Library ID required" });
    }

    const reservations = await prisma.reservationQueue.findMany({
      where: {
        book: {
          libraryId: libraryId,
        },
      },
      include: {
        member: {
          include: {
            user: {
              include: {
                student: true,
                teacher: true,
              },
            },
          },
        },
        book: true,
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return res.status(200).json(reservations);
  } catch (e: any) {
    console.error("Error fetching reservations:", e);
    return res
      .status(500)
      .json({ error: e.message || "Internal server error" });
  }
}
