
import { NextApiRequest, NextApiResponse } from "next";
import { ParentService } from "../../../../../lib/services/dashboard/parent-service";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;
    const user = (req as any).user;

    // Security check: Verify parent has access to this student
    const children = await ParentService.getChildren(user.id);
    const hasAccess = children.some((c: any) => c.id === studentId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: "Forbidden: You do not have access to this student's data" });
    }

    const overview = await ParentService.getChildDashboardOverview(studentId as string);
    res.status(200).json(overview);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
