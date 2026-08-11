
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { registerTeacherSchema } from "@/lib/validations/admin/teacher";
import { TeacherCreationService } from "@/lib/services/common/TeacherCreationService";
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

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { 
          page = "1", 
          limit = "10", 
          search = "", 
          status 
        } = req.query;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const take = parseInt(limit as string);

        const where: any = {
          schoolId: user.schoolId,
          isDeleted: false
        };

        if (search) {
          where.OR = [
            { user: { name: { contains: search as string, mode: 'insensitive' } } },
            { teacherSchoolId: { contains: search as string, mode: 'insensitive' } },
            { user: { email: { contains: search as string, mode: 'insensitive' } } },
            { user: { phone: { contains: search as string, mode: 'insensitive' } } },
          ];
        }

        if (status) where.status = status as any;

        const [teachers, total] = await Promise.all([
          prisma.teacher.findMany({
            where,
            include: {
              user: true,
              subjects: true,
            },
            skip,
            take,
            orderBy: { createdAt: "desc" }
          }),
          prisma.teacher.count({ where })
        ]);

        return res.status(200).json({
          success: true,
          data: teachers,
          pagination: {
            total,
            page: parseInt(page as string),
            limit: take,
            totalPages: Math.ceil(total / take)
          }
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to fetch teachers" });
      }

    case "POST":
      try {
        // Run Multer middleware
        await runMiddleware(
          req,
          res,
          upload.fields([{ name: 'profilePic', maxCount: 1 }])
        );

        const body = req.body;
        const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] };

        // Upload profile picture if provided
        let profilePicUrl = null;
        if (files?.profilePic?.[0]) {
          const uploadResult = await uploadFile(files.profilePic[0].buffer, 'users/teachers', 'image');
          profilePicUrl = uploadResult.url;
        } else if (!body.img) {
          // Dicebear fallback
          profilePicUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.name || 'default')}`;
        } else {
          profilePicUrl = body.img;
        }

        const validatedData = registerTeacherSchema.parse({
          ...body,
          img: profilePicUrl
        });
        
        // Ensure schoolId matches user's school
        if (validatedData.schoolId !== user.schoolId) {
          return res.status(403).json({ error: "Not authorized for this school" });
        }

        const result = await TeacherCreationService.createTeacherWithRetry({
          ...validatedData,
          profilePicUrl: validatedData.img
        } as any);

        return res.status(201).json({
            success: true,
            message: "Teacher registered successfully",
            data: result
        });
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res.status(400).json({ error: error.errors });
        }
        console.error("Teacher Registration Error:", error);
        return res.status(500).json({ error: error.message || "Failed to register teacher" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
