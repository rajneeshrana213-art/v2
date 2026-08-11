import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { ApplicationStatus } from "@prisma/client";

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

  // ── GET: list applications for a job ──────────────────────────────────────
  if (req.method === "GET") {
    try {
      const applications = await prisma.jobApplication.findMany({
        where: { jobId: id },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(applications);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  // ── PATCH: update a single application's status ────────────────────────────
  if (req.method === "PATCH") {
    const { applicationId, status } = req.body;

    if (!applicationId || typeof applicationId !== "string") {
      return res.status(400).json({ message: "applicationId required" });
    }

    const validStatuses: ApplicationStatus[] = [
      "PENDING",
      "REVIEWING",
      "SHORTLISTED",
      "REJECTED",
      "HIRED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    try {
      const updated = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status: status as ApplicationStatus },
      });
      return res.status(200).json(updated);
    } catch (e: any) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Application not found" });
      return res.status(500).json({ message: e.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
