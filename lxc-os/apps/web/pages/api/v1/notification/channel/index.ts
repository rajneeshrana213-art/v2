import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { verifyAuth } from "../../../../../lib/auth";
import { Role } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    // School Admin check
    if (user.role !== Role.admin && user.role !== Role.superadmin) { // Assuming admin is school admin
       return res.status(403).json({ error: "Forbidden" });
    }

    if (req.method === "GET") {
      const where: any = {};
      if (user.role === Role.admin) where.schoolId = user.schoolId;
      const channels = await prisma.notificationChannel.findMany({ where });
      return res.status(200).json(channels);
    }

    if (req.method === "POST") {
        // Only admin should be able to create channels for their school? 
        // Logic from original controller: isSchoolAdmin middleware used.
        const data = await prisma.notificationChannel.create({ data: req.body });
        return res.status(201).json(data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
