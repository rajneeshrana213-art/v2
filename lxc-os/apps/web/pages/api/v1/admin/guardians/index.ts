import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { getAllGuardians, getGuardiansOfSchool } from "@/lib/services/admin/guardian-service";
import { schoolIdParamSchema } from "@/lib/validations/admin/parent";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authResult = await verifyAuth(req, res);
    if (!authResult) return;

    if (req.method === "GET") {
      const { schoolId } = req.query;

      if (schoolId) {
        if (typeof schoolId !== "string") return res.status(400).json({ error: "Invalid schoolId" });
        const guardians = await getGuardiansOfSchool(schoolId);
        return res.status(200).json(guardians);
      } else {
        // Maybe restrict to superadmin?
        const guardians = await getAllGuardians();
        return res.status(200).json(guardians);
      }
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
