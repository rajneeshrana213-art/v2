
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const school = await prisma.school.findUnique({
          where: { id: user.schoolId },
          select: {
            schoolOpening: true,
            schoolClosing: true,
            lunchStart: true,
            lunchEnd: true,
            periodDuration: true
          }
        });

        if (!school) {
          return res.status(404).json({ error: "School not found" });
        }

        return res.status(200).json(school);
      } catch (error: any) {
        return res.status(500).json({ error: "Failed to fetch timetable configuration" });
      }

    case "PUT":
      try {
        const { schoolOpening, schoolClosing, lunchStart, lunchEnd, periodDuration } = req.body;

        // Basic validation
        if (!schoolOpening || !schoolClosing || !lunchStart || !lunchEnd || !periodDuration) {
          return res.status(400).json({ error: "All fields are required" });
        }

        const updatedSchool = await prisma.school.update({
          where: { id: user.schoolId },
          data: {
            schoolOpening,
            schoolClosing,
            lunchStart,
            lunchEnd,
            periodDuration: parseInt(periodDuration.toString())
          }
        });

        return res.status(200).json({
          message: "Configuration updated successfully",
          data: {
            schoolOpening: updatedSchool.schoolOpening,
            schoolClosing: updatedSchool.schoolClosing,
            lunchStart: updatedSchool.lunchStart,
            lunchEnd: updatedSchool.lunchEnd,
            periodDuration: updatedSchool.periodDuration
          }
        });
      } catch (error: any) {
        return res.status(500).json({ error: "Failed to update timetable configuration" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
