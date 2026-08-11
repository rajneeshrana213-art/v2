import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "superadmin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { jobId, status } = req.query;

      const where: any = {};
      if (jobId) where.jobId = String(jobId);
      if (status) where.status = String(status);

      const applications = await prisma.jobApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            select: { title: true },
          },
        },
      });
      return res.status(200).json(applications);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
