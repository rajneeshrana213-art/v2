import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { libraryId, fineId } = req.query;

    if (req.method === 'GET') {
        if (!libraryId || typeof libraryId !== 'string') return res.status(400).json({ error: "Library ID required" });
        try {
            const fines = await LibraryService.getFines(libraryId);
            return res.status(200).json(fines);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    if (req.method === 'POST') {
        if (!fineId || typeof fineId !== 'string') return res.status(400).json({ error: "Fine ID required" });
        try {
            const fine = await LibraryService.settleFine(fineId);
            return res.status(200).json(fine);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
