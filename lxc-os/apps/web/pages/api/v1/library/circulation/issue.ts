import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { issueBookSchema } from "@/lib/validations/library";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'POST') {
        const libraryId = (req.query.libraryId as string) || req.body.libraryId;
        
        if (!libraryId) return res.status(400).json({ error: "Library ID required" });

        const result = issueBookSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });

        try {
            const tx = await LibraryService.issueBook(libraryId, result.data);
            return res.status(200).json(tx);
        } catch(e: any) {
             return res.status(500).json({error: e.message});
        }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
}
