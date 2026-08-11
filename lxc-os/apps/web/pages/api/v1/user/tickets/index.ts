import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;

  if (req.method === "GET") {
    try {
      const tickets = await prisma.ticket.findMany({
        where: {
          userId: user.id,
          isDeleted: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          assignedTo: {
            select: { name: true, role: true }
          }
        }
      });

      return res.status(200).json(tickets);
    } catch (error) {
      console.error("Fetch User Tickets Error:", error);
      return res.status(500).json({ error: "Failed to fetch tickets" });
    }
  }

  if (req.method === "POST") {
    try {
      const { title, description, priority = "LOW", category = "GENERAL", attachment = null } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
      }

      const ticket = await prisma.ticket.create({
        data: {
          title,
          description,
          priority,
          category,
          attachment,
          status: "OPEN",
          userId: user.id,
          schoolId: user.schoolId || null,
        },
      });

      return res.status(201).json(ticket);
    } catch (error) {
      console.error("Create Ticket Error:", error);
      return res.status(500).json({ error: "Failed to create ticket" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, status, priority, category } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Ticket ID is required" });
      }

      const ticket = await prisma.ticket.update({
        where: {
          id: String(id),
          userId: user.id,
        },
        data: {
          ...(status ? { status } : {}),
          ...(priority ? { priority } : {}),
          ...(category ? { category } : {}),
        },
      });

      return res.status(200).json(ticket);
    } catch (error) {
      console.error("Update Ticket Error:", error);
      return res.status(500).json({ error: "Failed to update ticket" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Ticket ID is required" });
      }

      await prisma.ticket.update({
        where: {
          id: String(id),
          userId: user.id,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: user.id,
        },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Delete Ticket Error:", error);
      return res.status(500).json({ error: "Failed to delete ticket" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
