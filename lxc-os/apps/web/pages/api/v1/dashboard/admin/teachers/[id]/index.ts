
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { updateTeacherSchema } from "@/lib/validations/admin/teacher";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { uploadFile } from "@/lib/config/upload";

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res.status(400).json({ error: "User is not associated with a school" });
  }

  const { id } = req.query;
  const teacherId = id as string;

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const teacher = await prisma.teacher.findFirst({
          where: {
            id: teacherId,
            schoolId: user.schoolId
          },
          include: {
            user: true,
            subjects: true,
            lessons: {
              include: {
                subject: true,
                class: true,
                section: true
              }
            }
          }
        });

        if (!teacher) {
          return res.status(404).json({ error: "Teacher not found" });
        }

        return res.status(200).json({
          success: true,
          data: teacher
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to fetch teacher" });
      }

    case "PATCH":
      try {
        let body = req.body;
        let files = (req as any).files;

        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
          try {
            if (typeof body === 'string') {
              body = JSON.parse(body);
            } else if (!body) {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const data = Buffer.concat(buffers).toString();
              body = data ? JSON.parse(data) : {};
            }
          } catch (error) {
            console.error("JSON Parse Error:", error);
            body = {};
          }
        } else {
          await runMiddleware(
            req,
            res,
            upload.fields([{ name: 'profilePic', maxCount: 1 }])
          );
          body = req.body;
          files = (req as any).files;
        }

        let profilePicUrl = body.img || null;
        if (files?.profilePic?.[0]) {
          const uploadResult = await uploadFile(files.profilePic[0].buffer, 'users/teachers', 'image');
          profilePicUrl = uploadResult.url;
        }

        const validatedData = updateTeacherSchema.parse({
          ...body,
          img: profilePicUrl
        });

        const currentTeacher = await prisma.teacher.findFirst({
          where: { id: teacherId, schoolId: user.schoolId },
          select: { userId: true }
        });

        if (!currentTeacher) {
          return res.status(404).json({ error: "Teacher not found" });
        }

        const result = await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: currentTeacher.userId },
            data: {
              name: validatedData.name,
              email: validatedData.email,
              phone: validatedData.phone,
              userName: validatedData.userName,
              sex: validatedData.sex,
              bloodType: validatedData.bloodType,
              address: validatedData.address,
              city: validatedData.city,
              state: validatedData.state,
              country: validatedData.country,
              pincode: validatedData.pincode,
              profilePic: validatedData.img,
            }
          });

          const updatedTeacher = await tx.teacher.update({
            where: { id: teacherId },
            data: {
              teacherSchoolId: validatedData.teacherSchoolId,
              dateofJoin: validatedData.dateofJoin ? new Date(validatedData.dateofJoin) : undefined,
              fatherName: validatedData.fatherName,
              motherName: validatedData.motherName,
              dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
              maritalStatus: validatedData.maritalStatus,
              languagesKnown: validatedData.languagesKnown,
              qualification: validatedData.qualification,
              workExperience: validatedData.workExperience,
              previousSchool: validatedData.previousSchool,
              previousSchoolAddress: validatedData.previousSchoolAddress,
              previousSchoolPhone: validatedData.previousSchoolPhone,
              panNumber: validatedData.panNumber,
              status: validatedData.status,
              salary: validatedData.salary ? Math.floor(validatedData.salary) : undefined,
              contractType: validatedData.contractType,
              dateOfPayment: validatedData.dateOfPayment ? new Date(validatedData.dateOfPayment) : undefined,
              medicalLeave: validatedData.medicalLeave ?? undefined,
              casualLeave: validatedData.casualLeave ?? undefined,
              maternityLeave: validatedData.maternityLeave ?? undefined,
              sickLeave: validatedData.sickLeave ?? undefined,
              accountNumber: validatedData.accountNumber || undefined,
              bankName: validatedData.bankName || undefined,
              ifscCode: validatedData.ifscCode || undefined,
              branchName: validatedData.branchName || undefined,
              route: validatedData.route ?? undefined,
              hostelName: validatedData.hostelName ?? undefined,
              roomNumber: validatedData.roomNumber ?? undefined,
              facebook: validatedData.facebook ?? undefined,
              twitter: validatedData.twitter ?? undefined,
              linkedin: validatedData.linkedin ?? undefined,
              instagram: validatedData.instagram ?? undefined,
              youtube: validatedData.youtube ?? undefined,
            }
          });

          return updatedTeacher;
        });

        return res.status(200).json({
          success: true,
          message: "Teacher updated successfully",
          data: result
        });
      } catch (error: any) {
        console.error("Teacher UPDATE Error:", error);
        if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
        return res.status(500).json({ error: error.message || "Failed to update teacher" });
      }

    case "DELETE":
      try {
        const currentTeacher = await prisma.teacher.findFirst({
          where: { id: teacherId, schoolId: user.schoolId },
          select: { userId: true }
        });

        if (!currentTeacher) {
          return res.status(404).json({ error: "Teacher not found" });
        }

        await prisma.$transaction([
          prisma.user.delete({ where: { id: currentTeacher.userId } }),
          prisma.teacher.delete({ where: { id: teacherId } })
        ]);

        return res.status(200).json({
          success: true,
          message: "Teacher deleted successfully"
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to delete teacher" });
      }

    default:
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
