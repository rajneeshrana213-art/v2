import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await verifyAuth(req);
  if (!auth) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { email: true, phone: true }
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      const notifications = await prisma.notificationLog.findMany({
        where: {
          OR: [
            { recipient: user.email || "" },
            { recipient: user.phone || "" }
          ]
        },
        orderBy: { createdAt: "desc" },
        take: 50
      });

      return res.status(200).json(notifications);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
