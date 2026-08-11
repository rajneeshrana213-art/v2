import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { schoolId } = req.query;

    if (!schoolId || typeof schoolId !== "string") {
      return res.status(400).json({ error: "schoolId is required" });
    }

    const trips = await prisma.trip.findMany({
      where: {
        schoolId,
        status: "ACTIVE",
      },
      include: {
        driver: {
          include: { user: true },
        },
        bus: true,
        route: true,
        tripLocations: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return res.status(200).json(trips);
  } catch (error: any) {
    console.error("Active trips error:", error);
    return res.status(500).json({ error: "Failed to load active trips" });
  }
}


