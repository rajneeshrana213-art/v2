import { NextApiRequest, NextApiResponse } from "next";
import { DashboardService } from "../../../../lib/services/dashboard";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "../../../../lib/middleware/cors";

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

    if (req.method === "GET") {
      const branches =
        await DashboardService.groupAdmin.getBranches(schoolGroupId);
      return res.status(200).json(branches);
    }

    if (req.method === "POST") {
      const { schoolName, schoolCode, userId } = req.body;
      if (!schoolName || !userId) {
        return res
          .status(400)
          .json({ error: "School name and Owner ID are required" });
      }
      const newBranch = await DashboardService.groupAdmin.createBranch(
        schoolGroupId,
        {
          schoolName,
          schoolCode,
          userId,
        },
      );
      return res.status(201).json(newBranch);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Group Admin Branches API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
