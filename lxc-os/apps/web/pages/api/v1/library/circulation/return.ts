import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const returnSchema = z.object({
    transactionId: z.string().optional(),
    barcode: z.string().optional()
}).refine(data => data.transactionId || data.barcode, {
    message: "Either transactionId or barcode is required"
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'POST') {
        const result = returnSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });

        try {
            if (result.data.barcode) {
                const tx = await LibraryService.returnBookByBarcode(result.data.barcode);
                return res.status(200).json(tx);
            } else {
                const tx = await LibraryService.returnBook(result.data.transactionId!);
                return res.status(200).json(tx);
            }
        } catch(e: any) {
             return res.status(500).json({error: e.message});
        }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
}
