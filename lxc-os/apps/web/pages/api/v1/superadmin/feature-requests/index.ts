import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getFeaturesRequestList } from "@/lib/services/superadmin/feature-request-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden: Super Admin access required" });
    }

    if (req.method === "GET") {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const status = req.query.status ? parseInt(req.query.status as string) : undefined;
      const schoolId = req.query.schoolId as string;
      const moduleName = req.query.moduleName as string;
      const sortBy = req.query.sortBy as "createdAt" | "updatedAt" | "moduleName" | "schoolName" | "status";
      const sortOrder = req.query.sortOrder as "asc" | "desc";
      const search = req.query.search as string;

      const data = await getFeaturesRequestList({
        page,
        limit,
        status,
        schoolId,
        moduleName,
        sortBy,
        sortOrder,
        search
      });
      return res.status(200).json(data);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
