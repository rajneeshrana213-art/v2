import { NextApiRequest, NextApiResponse } from 'next';
import { AcademicService } from '@/lib/services/teacher/dashboard/AcademicService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        const { action } = req.query;

        // --- CLASSES ---
        if (req.method === 'GET' && action === 'classes') {
            const data = await AcademicService.getClasses(req.query.schoolId as string);
            return res.status(200).json(data);
        }
        if (req.method === 'POST' && action === 'class') {
            const data = await AcademicService.createClass(req.body);
            return res.status(201).json(data);
        }

        // --- SUBJECTS ---
        if (req.method === 'GET' && action === 'subjects') {
            const data = await AcademicService.getSubjects(req.query as any);
            return res.status(200).json(data);
        }
        if (req.method === 'POST' && action === 'subject') {
            const data = await AcademicService.createSubject(req.body);
            return res.status(201).json(data);
        }

        // --- LESSONS ---
        if (req.method === 'GET' && action === 'lessons') {
            const data = await AcademicService.getLessons(req.query as any);
            return res.status(200).json(data);
        }
        if (req.method === 'POST' && action === 'lesson') {
            const data = await AcademicService.createLesson(req.body);
            return res.status(201).json(data);
        }

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
