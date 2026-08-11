import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DocumentTemplateService } from "@/lib/services/superadmin/DocumentTemplateService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== Role.superadmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const schools = await DocumentTemplateService.getSchoolsForSharing();
    return res.status(200).json(schools);
  } catch (error: any) {
    console.error("Error in schools list API:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

