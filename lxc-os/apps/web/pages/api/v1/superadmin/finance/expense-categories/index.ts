import { NextApiRequest, NextApiResponse } from "next";
import {prisma} from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const categories = await prisma.internalExpenseCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = categorySchema.parse(req.body);

    const existing = await prisma.internalExpenseCategory.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    const category = await prisma.internalExpenseCategory.create({
      data: {
        name: body.name,
      },
    });

    return res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error creating expense category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
