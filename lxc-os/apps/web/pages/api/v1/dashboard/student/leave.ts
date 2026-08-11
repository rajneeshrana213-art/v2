import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    if (req.method === "GET") {
      const leaves = await prisma.leaveRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(leaves);
    }

    if (req.method === "POST") {
      const { fromDate, toDate, reason } = req.body;

      if (!fromDate || !toDate || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(fromDate);
      const end = new Date(toDate);

      if (start < today) {
        return res.status(400).json({ error: "From date cannot be in the past" });
      }
      if (end < start) {
        return res.status(400).json({ error: "To date cannot be before From date" });
      }

      const leave = await prisma.leaveRequest.create({
        data: {
          userId: user.id,
          fromDate: start,
          toDate: end,
          reason,
          isApproved: "PENDING",
          status: "PENDING",
        },
      });
      return res.status(201).json(leave);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Student Leave API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
