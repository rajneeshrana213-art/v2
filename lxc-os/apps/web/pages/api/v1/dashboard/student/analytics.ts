import { NextApiRequest, NextApiResponse } from "next";
import { TeacherService } from "@/lib/services/dashboard/teacher-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await verifyAuth(req);
  if (!auth) return res.status(401).json({ message: "Unauthorized" });

  const studentId = auth.role === "student" ? auth.id : null;
  if (!studentId) return res.status(403).json({ message: "Forbidden" });

  if (req.method === "GET") {
    try {
      const analytics = await TeacherService.getStudentAnalytics(studentId);
      return res.status(200).json(analytics);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
