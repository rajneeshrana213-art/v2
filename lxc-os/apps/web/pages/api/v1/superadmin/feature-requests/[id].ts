import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getFeatureRequestById } from "@/lib/services/superadmin/feature-request-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden: Super Admin access required" });
    }

    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid id" });
    }

    if (req.method === "GET") {
      const data = await getFeatureRequestById(id);
      if (!data) return res.status(404).json({ error: "Request not found" });
      return res.status(200).json(data);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
