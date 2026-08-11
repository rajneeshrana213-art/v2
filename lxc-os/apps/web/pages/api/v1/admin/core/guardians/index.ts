import { NextApiRequest, NextApiResponse } from 'next';
import { GuardianService } from '@/lib/services/admin/core/GuardianService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TODO: Auth

  const { schoolId } = req.query;

  if (schoolId && typeof schoolId === 'string') {
    try {
      const guardians = await GuardianService.getGuardiansOfSchool(schoolId);
      return res.status(200).json(guardians);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    // Handle authenticated guardian Logic or all guardians (admin)
    // Legacy route /admin/school/guardians vs /guardian-all/students
    // If user context indicates guardian, use getStudentsByAuthenticatedGuardian
    // We need proper auth middleware integration to determine 'req.user' equivalent.
    // For now returning 400 if minimal params missing for specific context.
    return res.status(400).json({ error: "School ID required" });
  }
}
