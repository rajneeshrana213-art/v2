import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
        try {
            const categories = await LibraryService.getCategories();
            return res.status(200).json(categories);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { id, name, description } = req.body;
            if (id) {
                const category = await LibraryService.updateCategory(id, name, description);
                return res.status(200).json(category);
            }
            if (!name) return res.status(400).json({ error: "Name required" });
            const category = await LibraryService.createCategory(name, description);
            return res.status(201).json(category);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            if (!id || typeof id !== 'string') return res.status(400).json({ error: "ID required" });
            await LibraryService.deleteCategory(id);
            return res.status(204).end();
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
