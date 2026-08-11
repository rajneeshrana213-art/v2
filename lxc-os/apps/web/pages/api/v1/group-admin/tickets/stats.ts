import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { TicketStatus, Role } from "@prisma/client";

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

  const schoolGroupId = (user as any).schoolGroupId;
  if (!schoolGroupId) {
    return res
      .status(400)
      .json({ message: "User not associated with an organization" });
  }

  try {
    const where = {
      OR: [
        { userId: user.id },
        {
          School: {
            groupId: schoolGroupId,
          },
        },
      ],
    };

    const stats = await prisma.ticket.groupBy({
      by: ["status"],
      where,
      _count: {
        status: true,
      },
    });

    const formattedStats = {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      cancelled: 0,
    };

    stats.forEach((item) => {
      const count = item._count.status;
      formattedStats.total += count;
      if (item.status === TicketStatus.OPEN) formattedStats.open = count;
      if (item.status === TicketStatus.IN_PROGRESS)
        formattedStats.inProgress = count;
      if (item.status === TicketStatus.RESOLVED)
        formattedStats.resolved = count;
      if (item.status === TicketStatus.CLOSED) formattedStats.closed = count;
      if (item.status === TicketStatus.CANCELLED)
        formattedStats.cancelled = count;
    });

    return res.status(200).json(formattedStats);
  } catch (error) {
    console.error("Error fetching group ticket stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
