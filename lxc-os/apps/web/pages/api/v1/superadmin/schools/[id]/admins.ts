import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { renderAndSendEmail } from "@/lib/utils/mailer";

const createAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  sex: z.enum(["MALE", "FEMALE", "OTHERS"]),
  bloodType: z.string().min(1, "Blood type is required"),
});

export default async function handler(req: any, res: NextApiResponse) {
  const { id: schoolId } = req.query;

  if (!schoolId || typeof schoolId !== "string") {
    return res.status(400).json({ message: "Invalid school ID" });
  }

  const authUser = await verifyAuth(req as NextApiRequest, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Super Admin access required" });
  }

  try {
    // POST: Add Extra Admin
    if (req.method === "POST") {
      const data = createAdminSchema.parse(req.body);

      // 1. Check if school exists
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
      });

      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      // 2. Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      // 3. Generate Password
      const generatedPassword = crypto
        .randomBytes(12)
        .toString("base64")
        .slice(0, 16);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      // 4. Create User
      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          sex: data.sex,
          bloodType: data.bloodType,
          password: hashedPassword,
          role: "admin",
          schoolId: schoolId,
          address: "N/A", // Placeholder since we don't have it in the simple form
          city: "N/A",
          state: "N/A",
          country: "N/A",
          pincode: "N/A",
        },
      });

      // 5. Send Welcome Email
      try {
        await renderAndSendEmail(
          "school-welcome",
          {
            adminName: data.name,
            schoolName: school.schoolName,
            schoolCode: school.schoolCode || "N/A",
            email: data.email,
            password: generatedPassword,
            loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
          },
          "Welcome to LearnXChain - Your Admin Account",
          data.email,
        );
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      return res.status(201).json({
        message: "Extra admin added successfully",
        admin: newUser,
      });
    }

    // DELETE: Remove Extra Admin
    if (req.method === "DELETE") {
      const { adminId } = req.body;

      if (!adminId || typeof adminId !== "string") {
        return res.status(400).json({ message: "Invalid admin ID" });
      }

      // 1. Check if the user exists and belongs to this school
      const adminToDelete = await prisma.user.findFirst({
        where: {
          id: adminId,
          schoolId: schoolId,
          role: "admin",
        },
      });

      if (!adminToDelete) {
        return res.status(404).json({ message: "Admin not found in this school" });
      }

      // 2. Check if this is the primary owner
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
      });

      if (school?.userId === adminId) {
        return res.status(400).json({
          message: "Cannot delete the primary school owner. Please transfer ownership first.",
        });
      }

      // 3. Delete (Soft delete if system supports it, here we'll just remove school association or delete)
      // Usually we soft delete
      await prisma.user.update({
        where: { id: adminId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: authUser.id,
        },
      });

      return res.status(200).json({ message: "Admin removed successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }
    console.error("Error managing school admins:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
