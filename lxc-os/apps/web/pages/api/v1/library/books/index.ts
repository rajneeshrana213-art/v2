import { NextApiRequest, NextApiResponse } from "next";
import { LibraryService } from "@/lib/services/library-service";
import { createBookSchema } from "@/lib/validations/library";
import { verifyAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

    if (req.method === 'GET') {
        const { libraryId } = req.query;
        if (!libraryId || typeof libraryId !== 'string') {
            return res.status(400).json({ error: "Library ID required" });
        }
        try {
            const books = await LibraryService.getBooks(libraryId, req.query);
            return res.status(200).json(books);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    if (req.method === 'POST') {
        const body = { ...req.body };
        // Allow libraryId from query to override or fill missing body field
        if (req.query.libraryId && !body.libraryId) {
            body.libraryId = req.query.libraryId;
        }

        const result = createBookSchema.safeParse(body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        try {
            const book = await LibraryService.createBook(result.data);
            return res.status(201).json(book);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
