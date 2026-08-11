
import { NextApiRequest, NextApiResponse } from "next";
import { EmployeeService } from "../../../../lib/services/dashboard/employee-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (req.method === "PATCH") {
      const { ticketId, status } = req.body;
      if (!ticketId || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const data = await EmployeeService.updateTicketStatus(user.id, ticketId, status);
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Ticket API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
