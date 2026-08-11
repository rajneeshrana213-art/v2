import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== "student") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const { newspaperId, content } = req.body;

        const submission = await prisma.newspaperSubmission.create({
          data: {
            newspaperId,
            studentId: user.id,
            content
          }
        });

        return res.status(201).json(submission);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
