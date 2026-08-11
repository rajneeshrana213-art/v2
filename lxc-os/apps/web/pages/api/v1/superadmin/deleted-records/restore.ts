import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";
// import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
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

    // Verify model has soft delete
    const modelMeta = Prisma.dmmf.datamodel.models.find(
      (m) => m.name === model,
    );
    const hasSoftDelete = modelMeta?.fields.some((f) => f.name === "isDeleted");

    if (!hasSoftDelete) {
      return res
        .status(400)
        .json({ message: "Model does not support soft deletes" });
    }

    const uniqueStringFields =
      modelMeta?.fields
        .filter((f) => f.isUnique && f.type === "String")
        .map((f) => f.name) || [];

    const existing = await (prisma as any)[model].findFirst({
      where: { id, isDeleted: true },
    });
    if (!existing) {
      return res.status(404).json({ message: "Record not found" });
    }

    const updateData: any = {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    };

    // Strip the _deleted_ suffix from unique fields
    for (const field of uniqueStringFields) {
      if (
        existing[field] &&
        typeof existing[field] === "string" &&
        existing[field].includes("_deleted_")
      ) {
        updateData[field] = existing[field].split("_deleted_")[0];
      }
    }

    // Restore record
    // We update isDeleted directly. Note that we use a custom query since the extension intercepts reads,
    // but update doesn't enforce isDeleted: false.
    const restoredRecord = await (prisma as any)[model].update({
      where: { id },
      data: updateData,
    });

    return res
      .status(200)
      .json({ message: "Record restored successfully", data: restoredRecord });
  } catch (error: any) {
    console.error("Restore Error:", error);
    if (error.code === "P2002") {
      return res.status(409).json({
        message:
          "Cannot restore: A unique field (e.g., email or username) is already taken by another active record.",
      });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Record not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
