import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const configSchema = z.object({
    maxBooksStudent: z.number().int().min(1),
    maxBooksTeacher: z.number().int().min(1),
    issueDaysStudent: z.number().int().min(1),
    issueDaysTeacher: z.number().int().min(1),
    finePerDay: z.number().min(0),
    fineGracePeriod: z.number().int().min(0),
    lostBookPenalty: z.number().min(0)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { libraryId } = req.query;
    
    if (!libraryId || typeof libraryId !== 'string') {
        return res.status(400).json({ error: "Library ID required" });
    }

    if (req.method === 'GET') {
        try {
            const policy = await LibraryService.getPolicy(libraryId);
            return res.status(200).json(policy || {});
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        const result = configSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        try {
            const policy = await LibraryService.updatePolicy(libraryId, result.data);
            return res.status(200).json(policy);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
