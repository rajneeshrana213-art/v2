import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const createCopySchema = z.object({
    bookId: z.string().min(1),
    barcode: z.string().min(1),
    rackLocation: z.string().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'POST') {
        const result = createCopySchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        
        try {
            const copy = await LibraryService.addCopy(result.data.bookId, result.data.barcode, result.data.rackLocation);
            return res.status(201).json(copy);
        } catch(e: any) {
            return res.status(500).json({error: e.message});
        }
    }
    
    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id || typeof id !== 'string') return res.status(400).json({error: "Copy ID required"});
        
        try {
            await LibraryService.deleteCopy(id);
            return res.status(200).json({message: "Deleted"});
        } catch(e: any) {
             return res.status(500).json({error: e.message});
        }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
}
