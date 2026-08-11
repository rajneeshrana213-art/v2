import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyAuth } from "../../../../lib/auth";
import { Role } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;
    
    if (user.role !== Role.admin && user.role !== Role.superadmin) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const logs = await prisma.notificationLog.findMany(); // TODO: Add pagination/filtering? Original has none.
    return res.status(200).json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
