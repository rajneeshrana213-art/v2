import { NextApiRequest, NextApiResponse } from 'next';
import { EducationalService } from '@/lib/services/admin/dashboard/EducationalService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { action, schoolId } = req.query; // ?action=classrooms, competitions, pyq, doubt

    try {
        if (req.method === 'GET') {
            if (action === 'classrooms') {
                 if (!schoolId) return res.status(400).json({ error: "School ID required" });
                 const data = await EducationalService.getClassrooms(schoolId as string);
                 return res.status(200).json(data);
            }
             if (action === 'leaderboard') {
                 const data = await EducationalService.getLeaderboard();
                 return res.status(200).json(data);
            }
            // Add other getters as needed
        }
        // Add POST/PUT handlers
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(400).json({ error: "Invalid action or method" });
}
