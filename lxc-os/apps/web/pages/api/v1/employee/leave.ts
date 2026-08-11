
import { NextApiRequest, NextApiResponse } from "next";
import { EmployeeService } from "../../../../lib/services/dashboard/employee-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (req.method === "POST") {
      const { fromDate, toDate, reason, type } = req.body;
      if (!fromDate || !toDate || !reason || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const data = await EmployeeService.applyLeave(user.id, { fromDate, toDate, reason, type });
      return res.status(200).json(data);
    } else if (req.method === "GET") {
      const data = await EmployeeService.getLeaveRequests(user.id);
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Leave API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
