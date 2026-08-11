import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { updateStudentSchema } from "@/lib/validations/admin/registration";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { uploadFile } from "@/lib/config/upload";

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser for Multer
  },
};

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

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Student ID is required" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const student = await prisma.student.findUnique({
          where: { id, schoolId: user.schoolId },
          include: {
            user: true,
            class: {
              include: { Section: true },
            },
            parent: {
              include: { user: true },
            },
            studentFeePlans: {
              where: { isActive: true },
              include: {
                feeStructure: true,
                academicYear: true,
                feeHeadAmounts: {
                  include: { feeHead: true },
                },
                concessions: {
                  where: { status: "APPROVED" },
                },
              },
            },
            // Get last few ledger entries for history
            financeLedger: {
              take: 10,
              orderBy: { createdAt: "desc" },
              include: {
                debitAccount: true,
                creditAccount: true,
              },
            },
          },
        });

        if (!student) {
          return res.status(404).json({ error: "Student not found" });
        }

        // Calculate pending fees
        const ledgerSummary = await prisma.financeLedger.aggregate({
          where: { studentId: id, schoolId: user.schoolId },
          _sum: { amount: true },
        });

        return res.status(200).json({
          success: true,
          data: {
            ...student,
            pendingFees: ledgerSummary._sum.amount || 0,
          },
        });
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: error.message || "Failed to fetch student details" });
      }

    case "PUT":
      try {
        // Run Multer middleware for file uploads
        await runMiddleware(
          req,
          res,
          upload.fields([{ name: "profilePic", maxCount: 1 }]),
        );

        const body = req.body;
        const files = (req as any).files as {
          [fieldname: string]: Express.Multer.File[];
        };

        // Upload profile picture if provided
        let profilePicUrl = body.profilePicUrl || null;
        if (files?.profilePic?.[0]) {
          const uploadResult = await uploadFile(
            files.profilePic[0].buffer,
            "users/profiles",
            "image",
          );
          profilePicUrl = uploadResult.url;
        }

        const validatedData = updateStudentSchema.parse({
          ...body,
          profilePicUrl: profilePicUrl,
        });

        // Update user and student in a transaction
        const updatedStudent = await prisma.$transaction(async (tx) => {
          const studentRecord = await tx.student.findUnique({
            where: { id, schoolId: user.schoolId },
            select: { userId: true },
          });

          if (!studentRecord) throw new Error("Student not found");

          // Update User fields
          await tx.user.update({
            where: { id: studentRecord.userId },
            data: {
              name: validatedData.name,
              email: validatedData.email,
              phone: validatedData.phone,
              sex: validatedData.sex as any,
              address:
                validatedData.address ||
                body.currentAddress ||
                body.permanentAddress,
              city: validatedData.city,
              state: validatedData.state,
              country: validatedData.country,
              pincode: validatedData.pincode,
              bloodType: validatedData.bloodType,
              profilePic: profilePicUrl || undefined,
            },
          });

          // Update Student fields
          const updatedStudent = await tx.student.update({
            where: { id },
            data: {
              status: validatedData.status as any,
              dateOfBirth: validatedData.dateOfBirth
                ? new Date(validatedData.dateOfBirth)
                : undefined,
              Religion: validatedData.Religion,
              category: validatedData.category,
              caste: validatedData.caste,
              motherTongue: validatedData.motherTongue,
              languagesKnown: validatedData.languagesKnown,
              currentAddress: validatedData.currentAddress,
              permanentAddress: validatedData.permanentAddress,
              classId: validatedData.classId,
              medicalCondition: (validatedData as any).medicalCondition,
              allergies: (validatedData as any).allergies,
              medicationName: (validatedData as any).medicationName,
            },
            include: { user: true, class: true },
          });

          // Update StudentAcademicRecord if class, section, or rollNo changes
          if (
            validatedData.classId ||
            validatedData.section ||
            validatedData.rollNo
          ) {
            const academicYear =
              (validatedData.academicYear as string) ||
              (
                await tx.studentAcademicRecord.findFirst({
                  where: { studentId: id as string },
                  orderBy: { academicYear: "desc" },
                  select: { academicYear: true },
                })
              )?.academicYear;

            if (academicYear) {
              await tx.studentAcademicRecord.upsert({
                where: {
                  studentId_academicYear: {
                    studentId: id as string,
                    academicYear: academicYear,
                  },
                },
                update: {
                  classId: validatedData.classId as string,
                  sectionId: validatedData.section as string,
                  rollNumber: validatedData.rollNo as string,
                },
                create: {
                  studentId: id as string,
                  academicYear: academicYear,
                  classId: (validatedData.classId as string) || "",
                  sectionId: validatedData.section as string,
                  rollNumber: (validatedData.rollNo as string) || "N/A",
                },
              });
            }
          }

          return updatedStudent;
        });

        return res.status(200).json({
          success: true,
          message: "Student updated successfully",
          data: updatedStudent,
        });
      } catch (error: any) {
        if (error.name === "ZodError")
          return res.status(400).json({ error: error.errors });
        console.error("Student Update Error:", error);
        return res
          .status(500)
          .json({ error: error.message || "Failed to update student" });
      }

    case "DELETE":
      try {
        await prisma.$transaction(async (tx) => {
          const student = await tx.student.findUnique({
            where: { id, schoolId: user.schoolId },
            select: { userId: true },
          });

          if (!student) throw new Error("Student not found");

          await tx.student.delete({ where: { id } });
          await tx.user.delete({ where: { id: student.userId } });
        });

        return res.status(200).json({
          success: true,
          message: "Student deleted successfully",
        });
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: error.message || "Failed to delete student" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
