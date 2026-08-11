import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { timetableservicesAutomatic } from "@/lib/services/timetable/timetable-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    if (req.method === "POST") {
      const { schoolId, options } = req.body;
      if (!schoolId) {
        return res.status(400).json({ success: false, message: "School ID is required" });
      }

      const response = await timetableservicesAutomatic.generateDraft(schoolId, options);
      if (response && response.success !== false) { // Basic check, refining based on service return type
        return res.status(200).json({ success: true, data: response });
      } else {
         return res.status(500).json(response); // Forwarding error details
      }
    }

    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
