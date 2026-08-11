import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res
      .status(400)
      .json({ error: "User is not associated with a school" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { classId, section, academicYear } = req.query;

        if (!classId || !academicYear) {
          return res
            .status(400)
            .json({ error: "Class ID and Academic Year are required" });
        }

        const where: any = {
          schoolId: user.schoolId,
          classId: classId as string,
          status: "ACTIVE",
          academicRecords: {
            some: {
              academicYear: academicYear as string,
              ...(section ? { sectionId: section as string } : {}),
            },
          },
        };

        const students = await prisma.student.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profilePic: true,
              },
            },
            class: {
              select: {
                name: true,
              },
            },
            academicRecords: {
              where: {
                academicYear: academicYear as string,
              },
              include: {
                section: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            user: {
              name: "asc",
            },
          },
        });

        return res.status(200).json({
          success: true,
          data: students,
        });
      } catch (error: any) {
        console.error("Fetch Students for Promotion Error:", error);
        return res
          .status(500)
          .json({ error: error.message || "Failed to fetch students" });
      }

    case "POST":
      try {
        const { studentIds, toClassId, toSection, toAcademicYear, toSession } =
          req.body;

        if (
          !studentIds ||
          !Array.isArray(studentIds) ||
          studentIds.length === 0
        ) {
          return res.status(400).json({ error: "Student IDs are required" });
        }

        if (!toClassId || !toAcademicYear || !toSection || !toSession) {
          return res.status(400).json({
            error:
              "Target class, section, academic year, and session are required",
          });
        }

        // Resolve section name → section ID before entering transaction
        const resolvedSection = await prisma.section.findFirst({
          where: { classId: toClassId, name: toSection },
          select: { id: true, name: true },
        });
        // Accept either a valid cuid (already an ID) or resolve from name
        const toSectionId = resolvedSection?.id || toSection;
        const toSectionName = resolvedSection?.name || toSection;

        // Process promotions in a transaction
        const result = await prisma.$transaction(async (tx) => {
          const promotions = [];

          for (const studentId of studentIds) {
            // Get current student data for history
            const currentStudent = await tx.student.findUnique({
              where: { id: studentId, schoolId: user.schoolId },
              include: {
                academicRecords: {
                  orderBy: { createdAt: "desc" },
                  take: 1,
                  include: {
                    section: true,
                  },
                },
              },
            });

            if (!currentStudent) {
              throw new Error(`Student with ID ${studentId} not found`);
            }

            // Update student
            await tx.student.update({
              where: { id: studentId },
              data: {
                classId: toClassId,
              },
            });

            // Update or create academic record for the new year
            await tx.studentAcademicRecord.upsert({
              where: {
                studentId_academicYear: {
                  studentId,
                  academicYear: toAcademicYear,
                },
              },
              update: {
                classId: toClassId,
                sectionId: toSectionId,
                promotionStatus: "PROMOTED",
              },
              create: {
                studentId,
                academicYear: toAcademicYear,
                classId: toClassId,
                sectionId: toSectionId,
                rollNumber:
                  currentStudent.academicRecords[0]?.rollNumber || "N/A",
                promotionStatus: "PROMOTED",
              },
            });

            // Create promotion record
            const promotion = await tx.studentPromotion.create({
              data: {
                studentId,
                fromClassId: currentStudent.classId!,
                toClassId: toClassId,
                fromSection:
                  currentStudent.academicRecords[0]?.section?.name || "N/A",
                toSection: toSectionName, // store human-readable section name
                academicYear: toAcademicYear,
                toSession: toSession,
              },
            });

            promotions.push(promotion);
          }

          return promotions;
        });

        return res.status(200).json({
          success: true,
          message: `${result.length} students promoted successfully`,
          data: result,
        });
      } catch (error: any) {
        console.error("Student Promotion Error:", error);
        return res
          .status(500)
          .json({ error: error.message || "Failed to promote students" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
