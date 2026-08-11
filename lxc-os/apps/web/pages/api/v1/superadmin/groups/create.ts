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

const createGroupSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  email: z.string().email("Invalid email address"),
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
        { name: "organizationLogo", maxCount: 1 },
        { name: "profilePic", maxCount: 1 },
      ]),
    );

    const body = req.body;
    const files = req.files;

    // 2. Validate Body
    const data = createGroupSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // 3. Auto-generate Password
    const generatedPassword = crypto
      .randomBytes(12)
      .toString("base64")
      .slice(0, 16);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // 4. Upload Files
    let organizationLogoUrl: string | null = null;
    let profilePicUrl: string | null = null;

    if (files?.organizationLogo?.[0]) {
      const uploadResult = await uploadFile(
        files.organizationLogo[0].buffer,
        "groups/logos",
        "image",
      );
      organizationLogoUrl = uploadResult.url;
    }

    if (files?.profilePic?.[0]) {
      const uploadResult = await uploadFile(
        files.profilePic[0].buffer,
        "users/profiles",
        "image",
      );
      profilePicUrl = uploadResult.url;
    }

    // 5. Transaction to create user and organization
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
            role: "group_admin",
            sex: data.sex,
            bloodType: data.bloodType,
            profilePic: profilePicUrl,
          },
        });

        // Create SchoolGroup
        const group = await tx.schoolGroup.create({
          data: {
            name: data.organizationName,
            logo: organizationLogoUrl,
            ownerId: user.id,
          },
        });

        // Update User with SchoolGroup ID
        await tx.user.update({
          where: { id: user.id },
          data: {
            schoolGroupId: group.id,
          },
        });

        return group;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );

    // 6. Send Welcome Email
    try {
      await renderAndSendEmail(
        "organization-welcome",
        {
          adminName: data.adminName,
          organizationName: data.organizationName,
          email: data.email,
          password: generatedPassword,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
        },
        "Welcome to LearnXChain - Your Organization Account",
        data.email,
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return res.status(201).json({
      message: "Organization created successfully",
      group: result,
      generatedPassword: generatedPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }
    console.error("Error creating organization:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
