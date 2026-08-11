import { NextApiRequest, NextApiResponse } from "next";
import { HostelExpenseService } from "@/lib/services/hostel/HostelExpenseService";
import { updateHostelExpenseSchema } from "@/lib/validations/hostel";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Expense ID is required" });
  }

  if (req.method === "GET") {
    try {
      const expense = await HostelExpenseService.getExpenseById(id);
      if (!expense) return res.status(404).json({ error: "Expense not found" });
      return res.status(200).json(expense);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const result = updateHostelExpenseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const expense = await HostelExpenseService.updateExpense(id, result.data);
      return res.status(200).json(expense);
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: "Expense not found" });
        return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      await HostelExpenseService.deleteExpense(id);
      return res.status(204).end();
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: "Expense not found" });
        return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
