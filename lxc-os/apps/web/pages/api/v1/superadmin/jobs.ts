import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { JobStatus } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  // ── GET: list all jobs with application count ──────────────────────────────
  if (req.method === "GET") {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [totalItems, jobs] = await Promise.all([
        prisma.jobPost.count(),
        prisma.jobPost.findMany({
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { applications: true } } },
          skip,
          take: limit,
        }),
      ]);

      return res.status(200).json({
        data: jobs,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit,
        },
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  // ── POST: create a new job post ────────────────────────────────────────────
  if (req.method === "POST") {
    const {
      title,
      location,
      type,
      tag,
      description,
      responsibilities = [],
      requirements = [],
      perks = [],
      status = "DRAFT",
    } = req.body;

    if (!title || !location || !type || !tag || !description) {
      return res
        .status(400)
        .json({
          message: "title, location, type, tag, and description are required",
        });
    }

    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    try {
      const job = await prisma.jobPost.create({
        data: {
          title,
          location,
          type,
          tag,
          description,
          responsibilities,
          requirements,
          perks,
          status: status as JobStatus,
        },
      });
      return res.status(201).json(job);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
