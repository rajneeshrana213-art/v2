import { NextApiRequest, NextApiResponse } from 'next';
import { TeacherService } from '@/lib/services/admin/core/TeacherService';
import { registerTeacherSchema } from '@/lib/validations/admin/teacher';
import { verifyAuth } from "@/lib/auth";
// Note: File upload handling in Next.js API routes requires simpler parsing or middleware.
// For migration speed, I'm defining the structure and assuming a separate upload handler 
// or I'll implement a basic wrapper if needed.
// Given strict instructions, I will implement a placeholder for file upload or use existing config.

export const config = {
  api: {
    bodyParser: false, // Disable built-in parser for file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
      const { schoolId } = req.query;
      if (!schoolId) return res.status(400).json({ error: "School ID required" });
      try {
          const teachers = await TeacherService.getAllTeachersBySchool(schoolId as string);
          return res.status(200).json(teachers);
      } catch (e: any) {
          return res.status(500).json({ error: e.message });
      }
  } else if (req.method === 'POST') {
      // Logic for POST with files would go here.
      // Since I cannot run middleware easily in this snippet without setup,
      // I will mark this as needing Migration of Upload Logic.
      return res.status(501).json({ error: "File upload logic pending migration." });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
