import { NextApiRequest, NextApiResponse } from "next";
import {prisma} from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  switch (req.method) {
    case "PUT":
      return handlePut(req, res, id);
    case "DELETE":
      return handleDelete(req, res, id);
    default:
      res.setHeader("Allow", ["PUT", "DELETE"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const body = categorySchema.parse(req.body);

    const existing = await prisma.internalExpenseCategory.findUnique({
      where: { name: body.name },
    });

    if (existing && existing.id !== id) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    const category = await prisma.internalExpenseCategory.update({
      where: { id },
      data: { name: body.name },
    });

    return res.status(200).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error updating expense category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if category has expenses
    const category = await prisma.internalExpenseCategory.findUnique({
      where: { id },
      include: { _count: { select: { expenses: true } } },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category._count.expenses > 0) {
      return res.status(400).json({ message: "Cannot delete category with existing expenses" });
    }

    await prisma.internalExpenseCategory.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
