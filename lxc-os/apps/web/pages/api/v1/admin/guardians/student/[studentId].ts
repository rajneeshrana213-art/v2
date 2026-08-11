import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getGuardianOfStudent, updateGuardian, deleteGuardian } from "@/lib/services/admin/guardian-service";
import { updateGuardianSchema } from "@/lib/validations/admin/guardian";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    const { studentId } = req.query;
    if (!studentId || typeof studentId !== "string") {
      return res.status(400).json({ error: "Invalid studentId" });
    }

    if (req.method === "GET") {
      const guardian = await getGuardianOfStudent(studentId);
      if (!guardian) return res.status(404).json({ error: "Guardian/Student not found" });
      return res.status(200).json(guardian);
    }

    if (req.method === "PUT") {
      const parsed = updateGuardianSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
      }
      const updated = await updateGuardian(studentId, parsed.data);
      return res.status(200).json({ message: "Guardian info updated successfully", updatedStudent: updated });
    }

    if (req.method === "DELETE") {
      const cleared = await deleteGuardian(studentId);
      return res.status(200).json({ message: "Guardian info deleted (cleared)", clearedGuardian: cleared });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
