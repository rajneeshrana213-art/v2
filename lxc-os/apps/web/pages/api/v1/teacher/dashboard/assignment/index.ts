import { NextApiRequest, NextApiResponse } from 'next';
import { AssignmentService } from '@/lib/services/teacher/dashboard/AssignmentService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        const { action } = req.query;

        // --- ASSIGNMENTS ---
        if (req.method === 'GET' && action === 'assignments') {
            const data = await AssignmentService.getAssignments(req.query as any);
            return res.status(200).json(data);
        }
        if (req.method === 'POST' && action === 'assignment') {
            const data = await AssignmentService.createAssignment(req.body);
            return res.status(201).json(data);
        }

        // --- HOMEWORK ---
        if (req.method === 'GET' && action === 'homework') {
            const data = await AssignmentService.getHomework(req.query as any);
            return res.status(200).json(data);
        }
        if (req.method === 'POST' && action === 'homework') {
            const data = await AssignmentService.createHomework(req.body);
            return res.status(201).json(data);
        }

        // --- NEWSPAPER ---
        if (req.method === 'GET' && action === 'newspaper') {
            const data = await AssignmentService.getNewspapers(req.query.classId as string);
            return res.status(200).json(data);
        }
        if (req.method === 'POST' && action === 'newspaper') {
            const data = await AssignmentService.createNewspaper(req.body);
            return res.status(201).json(data);
        }

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
