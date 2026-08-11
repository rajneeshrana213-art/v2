import { NextApiRequest, NextApiResponse } from "next";
import { ComplaintService } from "@/lib/services/hostel/ComplaintService";
import { updateComplaintSchema } from "@/lib/validations/hostel";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Complaint ID is required" });
  }

  if (req.method === "GET") {
    try {
      const complaint = await ComplaintService.getComplaintById(id);
      if (!complaint) return res.status(404).json({ error: "Complaint not found" });
      return res.status(200).json(complaint);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const result = updateComplaintSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const complaint = await ComplaintService.updateComplaint(id, result.data);
      return res.status(200).json(complaint);
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: "Complaint not found" });
        return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      await ComplaintService.deleteComplaint(id);
      return res.status(204).end();
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: "Complaint not found" });
        return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
