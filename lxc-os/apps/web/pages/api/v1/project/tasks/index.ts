import { NextApiRequest, NextApiResponse } from 'next';
import { TaskService } from '@/lib/services/project/TaskService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        const { action } = req.query;

        // --- TASKS ---
        if (req.method === 'GET' && !action) {
            const data = await TaskService.getTasks(req.query);
            return res.status(200).json(data);
        } 
        if (req.method === 'POST' && !action) {
            const data = await TaskService.createTask(req.body);
            return res.status(201).json(data);
        }

        // --- UPDATES ---
        if (req.method === 'PUT') {
             if (action === 'status') {
                 const data = await TaskService.updateStatus(req.query.id as string, req.body.stageId);
                 return res.status(200).json(data);
             }
             const data = await TaskService.updateTask(req.query.id as string, req.body);
             return res.status(200).json(data);
        }

        // --- DELETE ---
        if (req.method === 'DELETE') {
             await TaskService.deleteTask(req.query.id as string);
             return res.status(200).json({ message: "Deleted" });
        }

        // --- COMMENTS ---
        if (req.method === 'POST' && action === 'comment') {
             const data = await TaskService.addComment({ ...req.body, id: req.query.id });
             return res.status(201).json(data);
        }

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
