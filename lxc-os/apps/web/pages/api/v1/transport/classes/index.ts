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
      const classes = await prisma.class.findMany({
        where: { schoolId: userSchoolId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      return res.status(200).json(classes);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
