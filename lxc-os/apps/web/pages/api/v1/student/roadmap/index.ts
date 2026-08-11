import { NextApiRequest, NextApiResponse } from "next";
import { getAllRoadmaps, createRoadmap, createRoadmapSchema } from "@/lib/services/student-roadmap-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    try {
        if (req.method === 'GET') {
            const roadmaps = await getAllRoadmaps();
            return res.status(200).json(roadmaps);
        }

        if (req.method === 'POST') {
            const parsed = createRoadmapSchema.parse(req.body);
            const roadmap = await createRoadmap(parsed);
            return res.status(201).json(roadmap);
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
