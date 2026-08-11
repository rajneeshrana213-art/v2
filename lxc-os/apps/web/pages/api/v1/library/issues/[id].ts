import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id, libraryId } = req.query; // id is issueId

    if (req.method === 'PUT') {
        // Action: Return Book
        // Could differentiate query param ?action=return
        if (!id || typeof id !== 'string') return res.status(400).json({ error: "Issue ID required" });
        if (!libraryId || typeof libraryId !== 'string') return res.status(400).json({ error: "Library ID required" });

        try {
            const result = await LibraryService.returnBook(id, libraryId);
            return res.status(200).json(result);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
