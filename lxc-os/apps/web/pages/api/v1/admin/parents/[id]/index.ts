import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getParentById, deleteParent } from "@/lib/services/admin/parent-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid id" });
    }

    if (req.method === "GET") {
      const parent = await getParentById(id);
      if (!parent) return res.status(404).json({ success: false, message: "Parent not found" });
      return res.status(200).json({ success: true, data: parent });
    }

    if (req.method === "DELETE") {
      await deleteParent(id);
      return res.status(200).json({ success: true, message: "Parent deleted successfully" });
    }

    res.setHeader("Allow", ["GET", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
