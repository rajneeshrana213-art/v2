import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { listRoles } from "@/lib/services/analytics/usage-analytics-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Optional: Is auth required for listing roles? Assuming yes for consistency
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (req.method === "GET") {
      return res.status(200).json(listRoles());
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
