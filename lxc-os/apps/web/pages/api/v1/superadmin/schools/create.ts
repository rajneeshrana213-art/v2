import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { uploadFile } from "@/lib/config/upload";
import { renderAndSendEmail } from "@/lib/utils/mailer";

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const createSchoolSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  email: z.string().email("Invalid email address"),
  // password: z.string().min(6), // Password is now auto-generated
  adminName: z.string().min(1, "Admin name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
  sex: z.enum(["MALE", "FEMALE", "OTHERS"]),
  bloodType: z.string().min(1, "Blood type is required"),
});

export default async function handler(req: any, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authUser = await verifyAuth(req as NextApiRequest, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Super Admin access required" });
  }

  try {
    // 1. Run Multer middleware
    await runMiddleware(
      req,
      res,
      upload.fields([
        { name: "schoolLogo", maxCount: 1 },
        { name: "profilePic", maxCount: 1 },
      ]),
    );

    const body = req.body;
    const files = req.files;

    // 2. Validate Body
    const data = createSchoolSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // 3. Auto-generate Password using crypto for better security
    // Generate a cryptographically secure random password
    const generatedPassword = crypto
      .randomBytes(12)
      .toString("base64")
      .slice(0, 16);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // 4. Upload Files
    let schoolLogoUrl = null;
    let profilePicUrl = null;

    if (files?.schoolLogo?.[0]) {
      const uploadResult = await uploadFile(
        files.schoolLogo[0].buffer,
        "schools/logos",
        "image",
      );
      schoolLogoUrl = uploadResult.url;
    }

    if (files?.profilePic?.[0]) {
      const uploadResult = await uploadFile(
        files.profilePic[0].buffer,
        "users/profiles",
        "image",
      );
      profilePicUrl = uploadResult.url;
    }

    // Generate School Code
    const schoolCode = `SCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Transaction to create user and school
    const result = await prisma.$transaction(
      async (tx) => {
        // Create Admin User
        const user = await tx.user.create({
          data: {
            name: data.adminName,
            email: data.email,
            password: hashedPassword,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
            role: "admin",
            sex: data.sex,
            bloodType: data.bloodType,
            profilePic: profilePicUrl,
          },
        });

        // Create School
        const school = await tx.school.create({
          data: {
            schoolName: data.schoolName,
            schoolCode: schoolCode,
            schoolLogo: schoolLogoUrl,
            userId: user.id, // School owner
          },
        });

        // Update User with School ID
        await tx.user.update({
          where: { id: user.id },
          data: {
            schoolId: school.id,
          },
        });

        return school;
      },
      {
        maxWait: 15000, // Maximum time to wait for a connection from the pool (15 seconds)
        timeout: 30000, // Maximum time the transaction can run (30 seconds)
      },
    );

    // 6. Send Welcome Email
    try {
      await renderAndSendEmail(
        "school-welcome",
        {
          adminName: data.adminName,
          schoolName: data.schoolName,
          schoolCode: schoolCode,
          email: data.email,
          password: generatedPassword,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
        },
        "Welcome to LearnXChain - Your School Account",
        data.email,
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // We don't fail the request if email fails, but we should log it.
    }

    // Return success with generated password
    return res.status(201).json({
      message: "School created successfully",
      school: result,
      generatedPassword: generatedPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }
    console.error("Error creating school:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
