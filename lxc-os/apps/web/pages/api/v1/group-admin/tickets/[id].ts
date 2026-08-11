import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== Role.group_admin) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.query;
  const schoolGroupId = (user as any).schoolGroupId;

  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: id as string,
        OR: [
          { userId: user.id },
          {
            School: {
              groupId: schoolGroupId,
            },
          },
        ],
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
            profilePic: true,
            phone: true,
          },
        },
        employee: {
          include: {
            user: {
              select: {
                name: true,
                profilePic: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        User: {
          select: {
            name: true,
            profilePic: true,
            phone: true,
            email: true,
          },
        },
        School: {
          select: {
            schoolName: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket detail:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
