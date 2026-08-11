import { NextApiRequest, NextApiResponse } from "next";
import { AccommodationService } from "@/lib/services/hostel/AccommodationService";
import { createAccommodationRequestSchema } from "@/lib/validations/hostel";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      const { studentId } = req.query;
      const requests = await AccommodationService.getRequests(
        studentId ? { studentId: studentId as string } : undefined
      );
      return res.status(200).json(requests);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const result = createAccommodationRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const request = await AccommodationService.createRequest(result.data);
      return res.status(201).json(request);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
