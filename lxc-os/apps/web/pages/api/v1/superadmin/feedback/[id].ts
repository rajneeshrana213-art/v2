
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import z from "zod";

const updateFeedbackSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID provided" });
  }

  try {
    const body = updateFeedbackSchema.safeParse(req.body);

    if (!body.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: body.error.errors,
      });
    }

    const { status } = body.data;

    const feedback = await prisma.feedback.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });

    return res.status(200).json(feedback);
  } catch (error) {
    console.error("Error updating feedback:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
