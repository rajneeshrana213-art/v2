import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { registerStudentSchema } from "@/lib/validations/admin/registration";
import { StudentCreationService } from "@/lib/services/common/StudentCreationService";
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
  const { method, query } = req;
  const schoolId =
    user.role === "superadmin" ? (query.schoolId as string) : user.schoolId;

  if (!schoolId && user.role !== "superadmin") {
    return res
      .status(400)
      .json({ error: "User is not associated with a school" });
  }

  switch (method) {
    case "GET":
      try {
        const {
          page = "1",
          limit = "10",
          search = "",
          classId,
          status,
        } = query;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const take = parseInt(limit as string);

        const where: any = {
          schoolId: schoolId,
        };

        if (search) {
          where.OR = [
            {
              user: {
                name: { contains: search as string, mode: "insensitive" },
              },
            },
            {
              admissionNo: { contains: search as string, mode: "insensitive" },
            },
            {
              user: {
                email: { contains: search as string, mode: "insensitive" },
              },
            },
            {
              user: {
                phone: { contains: search as string, mode: "insensitive" },
              },
            },
          ];
        }

        if (classId) where.classId = classId as string;
        if (status) where.status = status as any;
        else where.status = "ACTIVE";

        const [students, total] = await Promise.all([
          prisma.student.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  profilePic: true,
                  role: true,
                  address: true,
                  city: true,
                  state: true,
                  country: true,
                  pincode: true,
                  bloodType: true,
                  sex: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              class: {
                select: { name: true },
              },
            },
            skip,
            take,
            orderBy: { createdAt: "desc" },
          }),
          prisma.student.count({ where }),
        ]);

        return res.status(200).json({
          success: true,
          data: students,
          pagination: {
            total,
            page: parseInt(page as string),
            limit: take,
            totalPages: Math.ceil(total / take),
          },
        });
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: error.message || "Failed to fetch students" });
      }

    case "POST":
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
        let profilePicUrl = null;
        if (files?.profilePic?.[0]) {
          const uploadResult = await uploadFile(
            files.profilePic[0].buffer,
            "users/profiles",
            "image",
          );
          profilePicUrl = uploadResult.url;
        }

        // Parse and validate the data
        // Note: Some fields may be missing from the form, but the schema requires them
        // We'll provide defaults for missing required fields
        const formData = {
          ...body,
          schoolId: user.schoolId, // Ensure schoolId is set from authenticated user
          profilePicUrl: profilePicUrl || null, // Add profile pic URL (null if not provided)
          // Provide defaults for fields that might not be in the simplified form
          primaryContact: body.primaryContact || body.phone || "Not Provided",
          Religion: body.Religion || "Not Specified",
          category: body.category || "General",
          caste: body.caste || "Not Specified",
          motherTongue: body.motherTongue || "Not Specified",
          languagesKnown: body.languagesKnown || "Not Specified",
          fatherName: body.fatherName || body.guardianName || "Not Provided",
          fatherPhone: body.fatherPhone || body.guardianPhone || "Not Provided",
          fatherOccupation: body.fatherOccupation || "Not Specified",
          motherName: body.motherName || "Not Provided",
          motherPhone: body.motherPhone || body.guardianPhone || "Not Provided",
          motherOccupation: body.motherOccupation || "Not Specified",
          guardianOccupation: body.guardianOccupation || "Not Specified",
          guardianAddress:
            body.guardianAddress ||
            body.currentAddress ||
            body.address ||
            "Not Provided",
          areSiblingStudying: body.areSiblingStudying || "No",
          siblingName: body.siblingName || "N/A",
          siblingClass: body.siblingClass || "N/A",
          siblingRollNo: body.siblingRollNo || "N/A",
          siblingAdmissionNo: body.siblingAdmissionNo || "N/A",
          currentAddress: body.currentAddress || body.address || "Not Provided",
          permanentAddress:
            body.permanentAddress ||
            body.currentAddress ||
            body.address ||
            "Not Provided",
          medicalCondition: body.medicalCondition || "None",
          allergies: body.allergies || "None",
          medicationName: body.medicationName || "None",
          address: body.address || body.currentAddress || "Not Provided",
          state: body.state || "Not Provided",
          country: body.country || "India",
          pincode: body.pincode || "000000",
          medicalCertificateUrl: body.medicalCertificateUrl || "N/A",
          transferCertificateUrl: body.transferCertificateUrl || "N/A",
        };

        const validatedData = registerStudentSchema.parse(formData);

        const result =
          await StudentCreationService.createStudentWithParentWithRetry(
            validatedData as any,
          );

        return res.status(201).json({
          success: true,
          message: "Student registered successfully",
          data: result,
        });
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res.status(400).json({ error: error.errors });
        }
        console.error("Student Registration Error:", error);
        return res
          .status(500)
          .json({ error: error.message || "Failed to register student" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
