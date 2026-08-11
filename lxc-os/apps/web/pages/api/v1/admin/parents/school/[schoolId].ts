import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getParentsBySchool } from "@/lib/services/admin/parent-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const { schoolId } = req.query;
    if (!schoolId || typeof schoolId !== "string") {
      return res.status(400).json({ error: "Invalid schoolId" });
    }

    if (req.method === "GET") {
      const { page = "1", limit = "10" } = req.query;
      const parsedPage = Math.max(1, parseInt(page as string) || 1);
      const parsedLimit = Math.max(1, parseInt(limit as string) || 10);

      const result = await getParentsBySchool(schoolId, parsedPage, parsedLimit);
      return res.status(200).json({
        success: true,
        data: result.parents,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
