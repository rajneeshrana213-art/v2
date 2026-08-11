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

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const job = await prisma.jobPost.findUnique({
        where: { id: String(id) },
        include: {
          applications: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (!job) return res.status(404).json({ message: "Job not found" });
      return res.status(200).json(job);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const {
        title,
        location,
        type,
        tag,
        description,
        responsibilities,
        requirements,
        perks,
        status,
      } = req.body;

      const job = await prisma.jobPost.update({
        where: { id: String(id) },
        data: {
          title,
          location,
          type,
          tag,
          description,
          responsibilities,
          requirements,
          perks,
          status,
        },
      });

      return res.status(200).json(job);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.jobPost.delete({
        where: { id: String(id) },
      });
      return res.status(200).json({ message: "Job deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
