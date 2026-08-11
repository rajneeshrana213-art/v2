import { NextApiRequest, NextApiResponse } from 'next';
import { TeacherProfileService } from '@/lib/services/teacher/dashboard/TeacherProfileService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        const { action } = req.query;

        if (req.method === 'GET' && action === 'profile') {
           const data = await TeacherProfileService.getProfile(req.query.userId as string);
           return res.status(200).json(data);
        }
        
        // --- LEAVE REQUESTS ---
        if (req.method === 'GET' && action === 'leave-requests') {
            const data = await TeacherProfileService.getLeaveRequests(req.query.userId as string);
            return res.status(200).json(data);
        }
        if (req.method === 'POST' && action === 'leave-request') {
            const data = await TeacherProfileService.createLeaveRequest(req.body);
            return res.status(201).json(data);
        }

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
