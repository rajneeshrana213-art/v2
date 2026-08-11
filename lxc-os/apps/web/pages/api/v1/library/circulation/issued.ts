import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { libraryId } = req.query;

    if (!libraryId || typeof libraryId !== 'string') {
        return res.status(400).json({ error: "Library ID required" });
    }

    try {
        const issues = await LibraryService.getIssuedBooks(libraryId);
        return res.status(200).json(issues);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
}
