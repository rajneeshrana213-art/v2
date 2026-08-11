import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { issueBookSchema } from "@/lib/validations/library";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'POST') {
        // Validation
        const result = issueBookSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });

        const { libraryId } = req.query; // Assuming context passed via query if not in body
        if (!libraryId) return res.status(400).json({ error: "Library ID required" });

        try {
            const issue = await LibraryService.issueBook(libraryId as string, result.data);
            return res.status(201).json(issue);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }
    
    // GET logic could be added here to list issues
    
    return res.status(405).json({ error: "Method not allowed" });
}
