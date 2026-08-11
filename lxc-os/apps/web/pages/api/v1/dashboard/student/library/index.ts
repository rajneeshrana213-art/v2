import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) return;

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { schoolId: true },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { search } = req.query;

    const books = await prisma.book.findMany({
      where: {
        library: { schoolId: student.schoolId },
        ...(search
          ? {
              OR: [
                { title: { contains: search as string, mode: "insensitive" } },
                { author: { contains: search as string, mode: "insensitive" } },
                { isbn: { contains: search as string, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: { select: { name: true } },
        _count: {
          select: { copies: true },
        },
      },
      take: 50,
      orderBy: { title: "asc" },
    });

    const formattedBooks = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      category: book.category?.name || "General",
      availableCopies: book._count.copies,
    }));

    res.status(200).json(formattedBooks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
