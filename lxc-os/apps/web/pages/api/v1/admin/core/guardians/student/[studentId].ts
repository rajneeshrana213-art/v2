import { NextApiRequest, NextApiResponse } from 'next';
import { GuardianService } from '@/lib/services/admin/core/GuardianService';
import { updateGuardianSchema } from '@/lib/validations/admin/core';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const { studentId } = req.query;

  if (!studentId || typeof studentId !== 'string') {
    return res.status(400).json({ error: "Student ID required" });
  }

  if (req.method === 'GET') {
    try {
      const guardian = await GuardianService.getGuardianOfStudent(studentId);
      if (!guardian) return res.status(404).json({ error: "Student/Guardian not found" });
      return res.status(200).json(guardian);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const result = updateGuardianSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.errors });
      
      const updated = await GuardianService.updateGuardian(studentId, result.data);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const cleared = await GuardianService.clearGuardianInfo(studentId);
      return res.status(200).json(cleared);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
