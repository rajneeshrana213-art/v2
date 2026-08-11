import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { verifyAuth } from "../../../../../lib/auth";
import { Role } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (req.method === "GET") {
      const where: any = {};
      if (user.role === Role.admin) where.schoolId = user.schoolId;
      const templates = await prisma.notificationTemplate.findMany({ where });
      return res.status(200).json(templates);
    } 
    
    if (req.method === "POST") {
      if (user.role !== Role.superadmin) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const data = await prisma.notificationTemplate.create({
        data: { ...req.body, createdBy: user.id },
      });
      return res.status(201).json(data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
