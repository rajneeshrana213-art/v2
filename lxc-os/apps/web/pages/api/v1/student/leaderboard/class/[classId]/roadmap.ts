import { NextApiRequest, NextApiResponse } from 'next';
import { getRoadmapLeaderboardService } from '@/lib/services/student-leaderboard-service';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { classId } = req.query;

  if (!classId || typeof classId !== 'string') {
    return res.status(400).json({ error: 'Class ID is required' });
  }

  try {
    const leaderboard = await getRoadmapLeaderboardService(classId);
    return res.status(200).json({ leaderboard });
  } catch (error: any) {
    console.error('Error fetching roadmap leaderboard:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
