
import { NextApiRequest, NextApiResponse } from "next";
import { EmployeeService } from "../../../../lib/services/dashboard/employee-service";
import { verifyAuth } from "../../../../lib/auth";
import { cors } from "@/lib/middleware/cors";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const user = await verifyAuth(req, res);
  if (!user) return;

  try {
    if (req.method === "POST") {
      const { type } = req.body; // 'in' or 'out'
      if (type === 'in') {
        const data = await EmployeeService.punchIn(user.id);
        return res.status(200).json(data);
      } else if (type === 'out') {
        const data = await EmployeeService.punchOut(user.id);
        return res.status(200).json(data);
      }
      return res.status(400).json({ error: "Invalid type" });
    } else if (req.method === "GET") {
      const employee = await prisma.employee.findFirst({ where: { userId: user.id } });
      if (!employee) {
        return res.status(404).json({ error: "Employee record not found" });
      }

      const { type, month, year } = req.query;

      if (type === 'monthly') {
        const selectedMonth = month ? parseInt(month as string) : undefined;
        const selectedYear = year ? parseInt(year as string) : undefined;
        const data = await EmployeeService.getMonthlyAttendance(employee.id, selectedMonth, selectedYear);
        return res.status(200).json(data);
      } else {
        // Default: today's attendance
        const data = await EmployeeService.getTodayAttendance(employee.id);
        return res.status(200).json(data);
      }
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Attendance API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
