import { NextApiRequest, NextApiResponse } from "next";
import { ComplaintService } from "@/lib/services/hostel/ComplaintService";
import { createComplaintSchema } from "@/lib/validations/hostel";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      const complaints = await ComplaintService.getAllComplaints();
      return res.status(200).json(complaints);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const result = createComplaintSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const complaint = await ComplaintService.createComplaint(result.data);
      return res.status(201).json(complaint);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
