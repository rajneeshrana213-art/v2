
import { NextApiRequest, NextApiResponse } from "next";
import { ParentService } from "../../../../../lib/services/dashboard/parent-service";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    const children = await ParentService.getChildren(user.id);
    res.status(200).json(children);
  } catch (error: any) {
    console.error("[PARENT_CHILDREN_ERROR]", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
