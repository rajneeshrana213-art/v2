import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getChildrenByParent } from "@/lib/services/admin/parent-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const { id } = req.query; // Using 'id' from folder structure [id]
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid parentId" });
    }

    if (req.method === "GET") {
      const data = await getChildrenByParent(id);
      return res.status(200).json({ success: true, data });
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
