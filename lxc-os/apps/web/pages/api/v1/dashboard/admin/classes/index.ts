import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { createClassSchema } from "@/lib/validations/admin/educational";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = authResult;
  const { schoolId: querySchoolId } = req.query;
  const targetSchoolId =
    String(user.role).toLowerCase() === "superadmin"
      ? (querySchoolId as string)
      : user.schoolId;

  if (!targetSchoolId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User is not associated with a school" });
  }

  const method = req.method;

  switch (method) {
    case "GET":
      try {
        const classes = await prisma.class.findMany({
          where: { schoolId: targetSchoolId },
          include: {
            Section: true,
            Teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    profilePic: true,
                  },
                },
              },
            },
            _count: {
              select: { students: true },
            },
          },
          orderBy: { name: "asc" },
        });
        return res.status(200).json(classes);
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: error.message || "Failed to fetch classes" });
      }

    case "POST":
      try {
        const validatedData = createClassSchema.parse(req.body);

        // Validate class name - same class name cannot exist in same school
        const existingClass = await prisma.class.findFirst({
          where: {
            schoolId: user.schoolId,
            name: validatedData.name,
          },
          select: { id: true, name: true },
        });

        if (existingClass) {
          return res.status(400).json({
            error: `A class with the name "${validatedData.name}" already exists in this school. Please use a different class name.`,
          });
        }

        const newClass = await prisma.class.create({
          data: {
            name: validatedData.name,
            capacity: validatedData.capacity,
            roomNumber: validatedData.roomNumber,
            schoolId: user.schoolId,
            Section: {
              create:
                validatedData.sections?.map((s) => ({
                  name: s.name,
                  capacity: s.capacity,
                })) || [],
            },
          },
          include: {
            Section: true,
          },
        });

        return res.status(201).json(newClass);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res.status(400).json({ error: error.errors });
        }
        return res
          .status(500)
          .json({ error: error.message || "Failed to create class" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
