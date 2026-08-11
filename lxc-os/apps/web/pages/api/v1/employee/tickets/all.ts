
import { NextApiRequest, NextApiResponse } from "next";
import { EmployeeService } from "../../../../../lib/services/dashboard/employee-service";
import { verifyAuth } from "../../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      const { status, priority, skipAssigned, myTickets } = req.query;
      const tickets = await EmployeeService.getAllTickets({
        status: status as any,
        priority: priority as any,
        skipAssigned: skipAssigned === 'true',
        assignedToId: myTickets === 'true' ? user.id : undefined
      });
      return res.status(200).json(tickets);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("All Tickets API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
