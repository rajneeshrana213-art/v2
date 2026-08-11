import { NextApiRequest, NextApiResponse } from "next";
import { DashboardService } from "../../../../../lib/services/dashboard";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "../../../../../lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const user = (req as any).user;
    if (user.role !== "group_admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const schoolGroupId = user.schoolGroupId;
    if (!schoolGroupId) {
      return res
        .status(400)
        .json({ error: "User not associated with a group" });
    }

    const { branchId } = req.query as { branchId: string };

    if (req.method === "GET") {
      const branch = await DashboardService.groupAdmin.getBranchById(
        branchId,
        schoolGroupId,
      );
      if (!branch) {
        return res.status(404).json({ error: "Branch not found" });
      }
      return res.status(200).json(branch);
    }

    if (req.method === "PATCH") {
      const data = req.body;
      const updated = await DashboardService.groupAdmin.updateBranch(
        branchId,
        schoolGroupId,
        data,
      );
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Branch Detail API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
