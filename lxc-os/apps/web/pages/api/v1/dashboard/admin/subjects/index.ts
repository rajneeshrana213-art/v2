
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { createSubjectSchema } from "@/lib/validations/admin/educational";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  if (req.method === "GET") {
    try {
      const { classId, search } = req.query;

      const subjects = await prisma.subject.findMany({
        where: {
          schoolId: user.schoolId as string,
          ...(classId && { classId: classId as string }),
          ...(search && {
            OR: [
              { name: { contains: search as string, mode: "insensitive" } },
              { code: { contains: search as string, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          class: {
            select: {
              name: true,
            },
          },
          teachers: {
            include: {
              user: {
                select: {
                  name: true,
                  profilePic: true
                }
              }
            }
          }
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json(subjects);
    } catch (error: any) {
      console.error("Fetch Subjects Error:", error);
      return res.status(500).json({ error: "Failed to fetch subjects" });
    }
  }

  if (req.method === "POST") {
    try {
      const validatedData = createSubjectSchema.parse(req.body);

      // Check for uniqueness within the same class
      const existing = await prisma.subject.findFirst({
        where: {
          classId: validatedData.classId,
          name: { equals: validatedData.name, mode: "insensitive" },
        },
      });

      if (existing) {
        return res.status(400).json({ error: "Subject already exists in this class" });
      }

      const subject = await prisma.subject.create({
        data: {
          ...validatedData,
          schoolId: user.schoolId as string,
        },
        include: {
          class: {
            select: {
              name: true,
            }
          }
        }
      });

      return res.status(201).json(subject);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      console.error("Create Subject Error:", error);
      return res.status(500).json({ error: "Failed to create subject" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
