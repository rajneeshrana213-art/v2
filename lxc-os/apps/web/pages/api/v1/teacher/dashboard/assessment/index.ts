import { NextApiRequest, NextApiResponse } from 'next';
import { AssessmentService } from '@/lib/services/teacher/dashboard/AssessmentService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        const { action } = req.query;

        // --- EXAMS ---
        if (req.method === 'GET' && action === 'exams') {
            const data = await AssessmentService.getExams(req.query as any);
            return res.status(200).json(data);
        }
        if (req.method === 'POST' && action === 'exam') {
            const data = await AssessmentService.createExam(req.body);
            return res.status(201).json(data);
        }

        // --- RESULTS ---
        if (req.method === 'GET' && action === 'results') {
            const data = await AssessmentService.getResults(req.query.examId as string);
            return res.status(200).json(data);
        }
        if (req.method === 'POST' && action === 'result') {
            const data = await AssessmentService.enterResult(req.body);
            return res.status(201).json(data);
        }

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
