import { NextApiRequest, NextApiResponse } from 'next';
import { TeacherService } from '@/lib/services/admin/core/TeacherService';
import { updateTeacherSchema } from '@/lib/validations/admin/teacher';
import { verifyAuth } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: true, // Enable for PUT (assuming no files for simple update or JSON update)
  },
};

// If update involves files, bodyParser should be false.
// Current update logic involves profile pic. 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

  if (req.method === 'GET') {
      try {
          const teacher = await TeacherService.getTeacherById(id);
          if (!teacher) return res.status(404).json({ error: "Teacher not found" });
          return res.status(200).json(teacher);
      } catch (e: any) {
          return res.status(500).json({ error: e.message });
      }
  } else if (req.method === 'DELETE') {
      try {
          await TeacherService.deleteTeacher(id);
          return res.status(200).json({ message: "Teacher deleted" });
      } catch (e: any) {
          return res.status(500).json({ error: e.message });
      }
  } else if (req.method === 'PUT') {
      // Need validation
      const result = updateTeacherSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.errors });

      try {
          const updated = await TeacherService.updateTeacher(id, result.data);
          return res.status(200).json(updated);
      } catch (e: any) {
          return res.status(500).json({ error: e.message });
      }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
