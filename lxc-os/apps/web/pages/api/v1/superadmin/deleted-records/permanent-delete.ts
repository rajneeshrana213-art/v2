import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id, model } = req.body;

    if (!id || !model) {
      return res
        .status(400)
        .json({ message: "Missing required fields: id, model" });
    }

    // Verify the record exists and is soft-deleted before proceeding
    const existing = await (prisma as any)[model].findFirst({
      where: { id, isDeleted: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Permanent delete
    await (prisma as any)[model].delete({
      where: { id, hardDelete: true } as any,
    });

    return res.status(200).json({ message: "Record permanently deleted" });
  } catch (error: any) {
    console.error("Permanent Delete Error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Record not found" });
    }
    if (error.code === "P2003") {
        return res.status(409).json({ message: "Cannot delete record because it is referenced by other records." });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
