import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { uploadFile } from "@/lib/config/upload";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const config = {
  api: { bodyParser: false },
};

const updateGroupSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  adminName: z.string().min(1, "Admin name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
  sex: z.enum(["MALE", "FEMALE", "OTHER", "OTHERS"]),
  bloodType: z.string().min(1, "Blood type is required"),
});

export default async function handler(req: any, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authUser = await verifyAuth(req as NextApiRequest, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Super Admin access required" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Missing or invalid group ID" });
  }

  try {
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

    const data = updateGroupSchema.parse(body);

    // Normalize the sex value to match the Prisma enum (OTHERS not OTHER)
    const sexValue = data.sex === "OTHER" ? "OTHERS" : data.sex;

    const group = await prisma.schoolGroup.findUnique({
      where: { id },
      include: { owner: { select: { id: true } } },
    });

    if (!group || group.isDeleted) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Upload new files only if provided
    let newLogoUrl: string | undefined;
    let newProfilePicUrl: string | undefined;

    if (files?.organizationLogo?.[0]) {
      const result = await uploadFile(
        files.organizationLogo[0].buffer,
        "groups/logos",
        "image",
      );
      newLogoUrl = result.url;
    }

    if (files?.profilePic?.[0]) {
      const result = await uploadFile(
        files.profilePic[0].buffer,
        "users/profiles",
        "image",
      );
      newProfilePicUrl = result.url;
    }

    await prisma.$transaction(async (tx) => {
      await tx.schoolGroup.update({
        where: { id },
        data: {
          name: data.organizationName,
          ...(newLogoUrl && { logo: newLogoUrl }),
        },
      });

      await tx.user.update({
        where: { id: group.owner.id },
        data: {
          name: data.adminName,
          phone: data.phone,
          sex: sexValue as any,
          bloodType: data.bloodType,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          ...(newProfilePicUrl && { profilePic: newProfilePicUrl }),
        },
      });
    });

    return res
      .status(200)
      .json({ message: "Organization updated successfully" });
  } catch (error: any) {
    console.error("Error updating organization:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
