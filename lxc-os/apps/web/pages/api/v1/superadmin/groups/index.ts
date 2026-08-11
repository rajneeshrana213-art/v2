import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Super Admin access required" });
  }

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        {
          owner: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [total, groups] = await Promise.all([
      prisma.schoolGroup.count({ where }),
      prisma.schoolGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              name: true,
              email: true,
              phone: true,
              address: true,
              city: true,
              state: true,
              country: true,
              pincode: true,
            },
          },
          _count: {
            select: { schools: true },
          },
        },
      }),
    ]);

    const data = groups.map((g) => ({
      id: g.id,
      name: g.name,
      logo: g.logo,
      isActive: !g.isDeleted,
      createdAt: g.createdAt,
      address: g.owner?.city && g.owner?.state ? `${g.owner.city}, ${g.owner.state}` : (g.owner?.city || g.owner?.state || 'Address Not Available'),
      owner: {
        name: (g as any).owner.name,
        email: (g as any).owner.email,
        phone: (g as any).owner.phone,
      },
      _count: {
        schools: (g as any)._count.schools,
      },
    }));

    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching groups:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
