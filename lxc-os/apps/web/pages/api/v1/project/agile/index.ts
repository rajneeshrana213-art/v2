import { NextApiRequest, NextApiResponse } from 'next';
import { AgileService } from '@/lib/services/project/AgileService';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        const { action } = req.query;

        // --- SPRINTS ---
        if (action === 'sprint') {
            if (req.method === 'GET') {
                const data = await AgileService.getSprints(req.query.projectId as string);
                return res.status(200).json(data);
            }
            if (req.method === 'POST') {
                const data = await AgileService.createSprint(req.body);
                return res.status(201).json(data);
            }
            if (req.method === 'PUT') {
                 const data = await AgileService.updateSprint(req.query.id as string, req.body);
                 return res.status(200).json(data);
            }
            if (req.method === 'DELETE') {
                 await AgileService.deleteSprint(req.query.id as string);
                 return res.status(200).json({ message: "Deleted" });
            }
        }

        // --- EPICS ---
        if (action === 'epic') {
             if (req.method === 'GET') {
                const data = await AgileService.getEpics(req.query.projectId as string);
                return res.status(200).json(data);
            }
            if (req.method === 'POST') {
                const data = await AgileService.createEpic(req.body);
                return res.status(201).json(data);
            }
        }

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
