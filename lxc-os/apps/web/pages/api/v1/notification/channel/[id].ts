import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { verifyAuth } from "../../../../../lib/auth";
import { Role } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;
    
    // School Admin check
    if (user.role !== Role.admin && user.role !== Role.superadmin) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const data = await prisma.notificationChannel.update({
      where: { id: String(id) },
      data: req.body,
    });
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
