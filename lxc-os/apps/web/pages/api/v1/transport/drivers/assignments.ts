import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userSchoolId = (session.user as any).schoolId;
    if (!userSchoolId) {
      return res
        .status(400)
        .json({ error: "No school ID associated with user" });
    }

    if (req.method === "GET") {
      const drivers = await prisma.driver.findMany({
        where: { schoolId: userSchoolId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          bus: true,
        },
      });
      return res.status(200).json(drivers);
    }

    if (req.method === "POST" || req.method === "PUT") {
      const { driverIds, busId } = req.body;

      if (!Array.isArray(driverIds) || driverIds.length === 0) {
        return res.status(400).json({ error: "No drivers selected" });
      }

      const updated = await prisma.driver.updateMany({
        where: {
          id: { in: driverIds },
          schoolId: userSchoolId,
        },
        data: {
          busId: busId || null,
        },
      });

      return res.status(200).json({ count: updated.count });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
