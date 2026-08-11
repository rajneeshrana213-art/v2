import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { TripStatus } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  // Auth check omitted for brevity, assuming middleware
  // const user = req.user;

  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { schoolId, status, driverId, activeOnly, routeId } = req.query;

    const where: any = {};
    if (schoolId) where.schoolId = schoolId as string;
    if (driverId) where.driverId = driverId as string;
    if (routeId) where.routeId = routeId as string;

    if (activeOnly === "true" || status === "ACTIVE") {
      where.status = TripStatus.ACTIVE;
    } else if (status) {
      where.status = status as string;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        driver: { include: { user: { select: { name: true, phone: true } } } },
        bus: true,
        route: { include: { busStops: true } },
        tripLocations: { take: 50, orderBy: { timestamp: "desc" } },
      },
      orderBy: { startedAt: "desc" },
    });

    return res.status(200).json(trips);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
