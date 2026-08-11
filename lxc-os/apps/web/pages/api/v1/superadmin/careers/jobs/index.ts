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
      const jobs = await prisma.jobPost.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      });
      return res.status(200).json(jobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === "POST") {
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

      if (!title || !location || !type || !tag || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const job = await prisma.jobPost.create({
        data: {
          title,
          location,
          type,
          tag,
          description,
          responsibilities: responsibilities || [],
          requirements: requirements || [],
          perks: perks || [],
          status: status || "DRAFT",
        },
      });

      return res.status(201).json(job);
    } catch (error: any) {
      console.error("Error creating job:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
