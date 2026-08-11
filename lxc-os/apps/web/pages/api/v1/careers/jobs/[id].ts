import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Public endpoint: intentionally accessible without session authentication.
// Individual job details are publicly viewable so candidates can read full
// job descriptions before applying. Only PUBLISHED jobs are served.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    const job = await prisma.jobPost.findUnique({
      where: {
        id: String(id),
      },
    });

    if (!job || job.status !== "PUBLISHED") {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json(job);
  } catch (error: any) {
    console.error("Error fetching job details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
