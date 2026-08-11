import { NextApiRequest, NextApiResponse } from 'next';
import { ProjectService } from '@/lib/services/project/ProjectService';
import { projectSchema, updateProjectSchema } from '@/lib/validations/project';
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        if (req.method === 'GET') {
            const data = await ProjectService.getProjects(req.query);
            return res.status(200).json(data);
        } else if (req.method === 'POST') {
             const result = projectSchema.safeParse(req.body);
             if (!result.success) return res.status(400).json({ error: result.error.errors });
             
             const data = await ProjectService.createProject(result.data);
             return res.status(201).json(data);
        } else if (req.method === 'PUT') {
             const { id } = req.query;
             const data = await ProjectService.updateProject(id as string, req.body);
             return res.status(200).json(data);
        } else if (req.method === 'DELETE') {
             const { id } = req.query;
             await ProjectService.deleteProject(id as string);
             return res.status(200).json({ message: "Deleted" });
        }
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
    return res.status(405).end();
}
