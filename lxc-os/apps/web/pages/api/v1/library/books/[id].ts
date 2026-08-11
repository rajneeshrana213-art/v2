import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { updateBookSchema } from "@/lib/validations/library";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "Book ID required" });

    if (req.method === 'GET') {
        try {
            const book = await LibraryService.getBookById(id);
            if (!book) return res.status(404).json({ error: "Book not found" });
            return res.status(200).json(book);
        } catch (e: any) {
             return res.status(500).json({ error: e.message });
        }
    }

    if (req.method === 'PUT') {
         const result = updateBookSchema.safeParse(req.body);
         if (!result.success) return res.status(400).json({ error: result.error.errors });

         try {
             const updated = await LibraryService.updateBook(id, result.data);
             return res.status(200).json(updated);
         } catch (e: any) {
             return res.status(500).json({ error: e.message });
         }
    }

    if (req.method === 'DELETE') {
        try {
            await LibraryService.deleteBook(id);
            return res.status(200).json({ message: "Book deleted" });
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
