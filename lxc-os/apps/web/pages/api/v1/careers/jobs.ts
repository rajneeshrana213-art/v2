import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Public endpoint: intentionally accessible without session authentication.
// Job listings are publicly viewable to allow candidates to browse open
// positions. Only PUBLISHED jobs are returned.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const jobs = await prisma.jobPost.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(jobs);
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
