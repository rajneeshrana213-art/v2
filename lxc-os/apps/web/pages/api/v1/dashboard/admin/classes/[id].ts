
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { updateClassSchema } from "@/lib/validations/admin/educational";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid class ID" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const classDetail = await prisma.class.findUnique({
          where: { id, schoolId: user.schoolId },
          include: { Section: true }
        });
        if (!classDetail) return res.status(404).json({ error: "Class not found" });
        return res.status(200).json(classDetail);
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to fetch class detail" });
      }

    case "PUT":
      try {
        const validatedData = updateClassSchema.parse(req.body);
        const { sections, ...classData } = validatedData;
        
        // Validate class name if it's being updated - same class name cannot exist in same school
        if (classData.name) {
          const existingClass = await prisma.class.findFirst({
            where: {
              schoolId: user.schoolId,
              name: classData.name,
              id: { not: id }, // Exclude the current class being updated
            },
            select: { id: true, name: true },
          });

          if (existingClass) {
            return res.status(400).json({ 
              error: `A class with the name "${classData.name}" already exists in this school. Please use a different class name.` 
            });
          }
        }
        
        const updatedClass = await prisma.$transaction(async (tx) => {
          // Update class basic info
          const cls = await tx.class.update({
            where: { id, schoolId: user.schoolId },
            data: classData
          });

          // Sync sections
          if (sections) {
            for (const sec of sections) {
              if (sec.id) {
                await tx.section.update({
                  where: { id: sec.id },
                  data: { 
                    name: sec.name,
                    capacity: sec.capacity
                  }
                });
              } else {
                await tx.section.create({
                  data: {
                    name: sec.name,
                    capacity: sec.capacity,
                    classId: id
                  }
                });
              }
            }
          }
          return cls;
        });

        return res.status(200).json(updatedClass);
      } catch (error: any) {
        if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
        return res.status(500).json({ error: error.message || "Failed to update class" });
      }

    case "DELETE":
      try {
        await prisma.$transaction(async (tx) => {
          // Delete related StudentPromotion records (both from and to)
          await tx.studentPromotion.deleteMany({
            where: {
              OR: [
                { fromClassId: id as string },
                { toClassId: id as string }
              ]
            }
          });

          // Delete related PYQ records
          await tx.pYQ.deleteMany({
            where: { classId: id as string }
          });

          // Delete sections
          await tx.section.deleteMany({
            where: { classId: id as string }
          });

          // Finally delete the class
          await tx.class.delete({
            where: { id, schoolId: user.schoolId }
          });
        });
        return res.status(204).end();
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to delete class" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
