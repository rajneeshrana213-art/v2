import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { timetableservicesAutomatic } from "@/lib/services/timetable/timetable-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    const { draftId } = req.query;
    if (!draftId || typeof draftId !== "string") {
      return res.status(400).json({ error: "Invalid draftId" });
    }

    if (req.method === "POST") {
        const response: any = await timetableservicesAutomatic.approveDraft(draftId);
        if (response.success) {
            return res.status(200).json({ success: true, data: response });
        } else {
            return res.status(500).json({ success: false, message: response.error || "Failed to approve draft" });
        }
    }

    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
