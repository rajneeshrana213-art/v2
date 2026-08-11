import { NextApiRequest, NextApiResponse } from "next";
import { getRoadmapById, updateRoadmap, deleteRoadmap, updateRoadmapSchema } from "@/lib/services/student-roadmap-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });

    try {
        if (req.method === 'GET') {
            const roadmap = await getRoadmapById(id);
            if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });
            return res.status(200).json(roadmap);
        }

        if (req.method === 'PUT') {
            const parsed = updateRoadmapSchema.parse(req.body);
            const roadmap = await updateRoadmap(id, parsed);
            return res.status(200).json(roadmap);
        }

        if (req.method === 'DELETE') {
            await deleteRoadmap(id);
            return res.status(204).end();
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
