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
import { createPlanInvoice } from "@/lib/utils/invoice-utils";

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

const createBranchSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
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
  if (!authUser || authUser.role !== "group_admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Group Admin access required" });
  }

  const schoolGroupId = (authUser as any).schoolGroupId;
  if (!schoolGroupId) {
    return res
      .status(400)
      .json({ message: "User not associated with an organization" });
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
    const data = createBranchSchema.parse(body);

    // Check Organization Limits
    const group = await prisma.schoolGroup.findUnique({
      where: { id: schoolGroupId },
      include: {
        schools: { where: { isDeleted: false } },
        subscriptions: {
          where: { isActive: true },
          include: { plan: true },
          orderBy: { endDate: "desc" },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // 1. Enforce Branch Limit
    if (group.schools.length >= group.branchLimit) {
      return res.status(403).json({
        message: `Branch limit reached (${group.branchLimit}). Please upgrade your plan to add more schools.`,
      });
    }

    // 2. Enforce Student Limit (across organization)
    const activeSub = group.subscriptions[0];
    const totalStudentsInGroup = await prisma.student.count({
      where: { school: { groupId: schoolGroupId }, status: "ACTIVE" },
    });

    if (
      activeSub?.plan?.userLimit &&
      totalStudentsInGroup >= activeSub.plan.userLimit
    ) {
      return res.status(403).json({
        message: `Organization-wide student limit reached (${activeSub.plan.userLimit}). Please upgrade your plan.`,
      });
    }

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
    let schoolLogoUrl: string | null = null;
    let profilePicUrl: string | null = null;

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
    const schoolCode = `BR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

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

        // Create School (Branch)
        const school = await tx.school.create({
          data: {
            schoolName: data.schoolName,
            schoolCode: schoolCode,
            schoolLogo: schoolLogoUrl,
            userId: user.id, // School owner
            groupId: schoolGroupId, // Link to Organization
          },
        });

        // Update User with School ID
        await tx.user.update({
          where: { id: user.id },
          data: {
            schoolId: school.id,
          },
        });

        let subId = null;

        // 3. Inherit Active Subscription if exists
        if (activeSub) {
          const sub = await tx.subscription.create({
            data: {
              planId: activeSub.planId,
              schoolId: school.id,
              schoolGroupId: schoolGroupId,
              startDate: activeSub.startDate,
              endDate: activeSub.endDate,
              paymentId: activeSub.paymentId,
              orderId: activeSub.orderId,
              status: activeSub.status,
              isActive: true, // It is inheriting an active plan
              userLimit: activeSub.userLimit,
            },
          });
          subId = sub.id;

          // Also create/set the SchoolSubscriptionConfig for the new branch
          await tx.schoolSubscriptionConfig.create({
            data: {
              schoolId: school.id,
              planModel: "MODEL_B", // Group plans are always Fixed Plans for the branches
              allowedUsers:
                activeSub.userLimit || (activeSub as any).plan?.userLimit || 1,
            },
          });
        }

        return { school, subId };
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );

    // 5b. Trigger Invoice Generation if subscription was inherited
    if (result.subId) {
      createPlanInvoice(result.subId).catch((err) =>
        console.error("Background branch-inherited invoice error:", err),
      );
    }

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
        "Welcome to LearnXChain - Your School Branch Account",
        data.email,
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return res.status(201).json({
      message: "Branch created successfully",
      school: result.school,
      generatedPassword: generatedPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }
    console.error("Error creating branch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
