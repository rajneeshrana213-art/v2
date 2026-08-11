import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const reserveSchema = z.object({
    memberId: z.string().min(1),
    bookId: z.string().min(1)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'POST') {
        const result = reserveSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        try {
            const reservation = await LibraryService.reserveBook(result.data.memberId, result.data.bookId);
            return res.status(201).json(reservation);
        } catch(e: any) {
            return res.status(500).json({ error: e.message });
        }
    }
    return res.status(405).json({error: "Method not allowed"});
}
