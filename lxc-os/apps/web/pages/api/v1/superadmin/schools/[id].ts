import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { uploadFile } from "@/lib/config/upload";
import { cache } from "@/lib/cache";

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

export default async function handler(req: any, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid school ID" });
  }

  const authUser = await verifyAuth(req as NextApiRequest, res);
  if (!authUser || authUser.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Super Admin access required" });
  }

  try {
    // Run Multer middleware for methods that might strictly upload files (PUT/PATCH in this context if we want to support it)
    // However, GET doesn't need it. But since we disabled bodyParser globally for this route,
    // we MUST run multer (or a body parser) to get req.body for PUT/PATCH.
    // For GET, we don't care about body.

    if (req.method === "PUT" || req.method === "PATCH") {
      await runMiddleware(
        req,
        res,
        upload.fields([
          { name: "schoolLogo", maxCount: 1 },
          { name: "profilePic", maxCount: 1 },
        ]),
      );
    }

    // GET: Fetch single school details
    if (req.method === "GET") {
      const cacheKey = `superadmin:school:${id}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }

      const school = await prisma.school.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              profilePic: true,
              address: true,
              city: true,
              state: true,
              country: true,
              pincode: true,
              sex: true, // Needed for edit form
              bloodType: true, // Needed for edit form
            },
          },
          users: {
            where: {
              role: "admin",
              isDeleted: false,
              NOT: {
                  id: undefined // This will be handled in JS or we can check against owner ID in include
              }
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profilePic: true,
              createdAt: true,
            }
          },
          _count: {
            select: {
              students: true,
              teachers: true,
              Class: true,
            },
          },
          subscription: {
            // Fetch latest subscription regardless of isActive state.
            // The isActive flag is lazily updated; real expiry is computed
            // from endDate on the frontend for correct real-time display.
            orderBy: { endDate: 'desc' },
            take: 1,
            include: {
              plan: true,
            },
          },
        },
      });

      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      // Short TTL (10s) so superadmin always sees near-real-time subscription status
      await cache.set(`superadmin:school:${id}`, school, 10);
      return res.status(200).json(school);
    }

    // PATCH: Toggle Status
    if (req.method === "PATCH") {
      const { isActive } = req.body;

      // Note: Multer parses booleans as strings "true"/"false" in req.body
      let activeStatus = isActive;
      if (typeof isActive === "string") {
        activeStatus = isActive === "true";
      }

      if (typeof activeStatus !== "boolean") {
        return res.status(400).json({ message: "Invalid active status" });
      }

      const updatedSchool = await prisma.school.update({
        where: { id },
        data: { isActive: activeStatus },
      });

      await cache.delete(`superadmin:school:${id}`);
      return res.status(200).json(updatedSchool);
    }

    // PUT: Full Update
    if (req.method === "PUT") {
      const body = req.body;
      const files = req.files;

      let schoolLogoUrl = undefined;
      let profilePicUrl = undefined;

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

      const updatedSchool = await prisma.school.update({
        where: { id },
        data: {
          schoolName: body.schoolName,
          schoolLogo: schoolLogoUrl, // undefined means don't update
          user: {
            update: {
              name: body.adminName,
              email: body.email,
              phone: body.phone,
              sex: body.sex,
              bloodType: body.bloodType,
              profilePic: profilePicUrl, // undefined means don't update
              // Address fields for user (often same as school but can be different, here we assume sync or passed in body)
              // If body has specific user address fields, use them, otherwise maybe reuse school?
              // The form sends these.
              address: body.address, // Assuming admin lives at school or using same address fields
              city: body.city,
              state: body.state,
              country: body.country,
              pincode: body.pincode,
            },
          },
        },
        include: { user: true },
      });

      await cache.delete(`superadmin:school:${id}`);
      return res.status(200).json(updatedSchool);
    }

    // DELETE: Delete School
    if (req.method === "DELETE") {
      await prisma.school.delete({
        where: { id },
      });

      await cache.delete(`superadmin:school:${id}`);
      return res.status(200).json({ message: "School deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error handling school request:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: String(error) });
  }
}
