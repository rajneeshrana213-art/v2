import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";

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
    const { search } = req.query;

    // Return all schools (including those with active subscriptions)
    const where: any = {};

    if (search) {
      where.OR = [
        { schoolName: { contains: search as string, mode: "insensitive" } },
        { schoolCode: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const schoolsList = await prisma.school.findMany({
      where,
      select: {
        id: true,
        schoolName: true,
        schoolCode: true,
        schoolLogo: true,
        isActive: true,
        subscriptionConfig: true,
        subscription: {
          where: { isActive: true },
          take: 1,
          select: {
            status: true,
            endDate: true,
            plan: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: 20,
      orderBy: { schoolName: "asc" },
    });

    // Fetch user counts for all schools in a single query (avoids N+1)
    const schoolIds = schoolsList.map((s) => s.id);
    const userCountRows = await prisma.user.groupBy({
      by: ["schoolId"],
      where: {
        schoolId: { in: schoolIds },
        role: {
          in: [
            "student",
            "teacher",
            "driver",
            "parent",
            "admin",
            "account",
            "hostel",
            "transport",
            "staff",
            "academics",
          ],
        },
      },
      _count: { id: true },
    });
    const userCountMap = new Map(
      userCountRows.map((row) => [row.schoolId, row._count.id]),
    );

    const schools = schoolsList.map((school) => {
      const config = school.subscriptionConfig;
      return {
        ...school,
        count: {
          currentUsers: userCountMap.get(school.id) || 0,
          allowedUsers: config?.allowedUsers || 0,
          bonusUsers: config?.bonusUsers || 0,
          model: config?.planModel || "MODEL_A",
        },
      };
    });

    return res.status(200).json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
