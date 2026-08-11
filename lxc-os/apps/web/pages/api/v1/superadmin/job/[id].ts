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

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Missing job id" });
  }

  // ── PUT: update job (fields + status) ─────────────────────────────────────
  if (req.method === "PUT") {
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

    if (status && !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    try {
      const updated = await prisma.jobPost.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(location !== undefined && { location }),
          ...(type !== undefined && { type }),
          ...(tag !== undefined && { tag }),
          ...(description !== undefined && { description }),
          ...(responsibilities !== undefined && { responsibilities }),
          ...(requirements !== undefined && { requirements }),
          ...(perks !== undefined && { perks }),
          ...(status !== undefined && { status: status as JobStatus }),
        },
      });
      return res.status(200).json(updated);
    } catch (e: any) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Job not found" });
      return res.status(500).json({ message: e.message });
    }
  }

  // ── DELETE: remove job (cascades applications) ─────────────────────────────
  if (req.method === "DELETE") {
    try {
      await prisma.jobPost.delete({ where: { id } });
      return res.status(200).json({ message: "Job deleted" });
    } catch (e: any) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Job not found" });
      return res.status(500).json({ message: e.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
