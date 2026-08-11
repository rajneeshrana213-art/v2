import { NextApiRequest, NextApiResponse } from "next";
import { MedicalEmergencyService } from "@/lib/services/hostel/MedicalEmergencyService";
import { createMedicalEmergencySchema } from "@/lib/validations/hostel";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      const emergencies = await MedicalEmergencyService.getAllEmergencies();
      return res.status(200).json(emergencies);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const result = createMedicalEmergencySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const emergency = await MedicalEmergencyService.createEmergency(result.data);
      return res.status(201).json(emergency);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
