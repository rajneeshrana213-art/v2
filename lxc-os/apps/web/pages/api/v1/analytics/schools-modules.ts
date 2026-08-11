import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getSchoolsWithModules } from "@/lib/services/analytics/usage-analytics-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    // Maybe restrict to superadmin/admin? Leaving generic authenticated for now unless specified
    
    if (req.method === "GET") {
      const data = await getSchoolsWithModules();
      return res.status(200).json(data);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
