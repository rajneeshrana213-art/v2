import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import multer from "multer";
import { runMiddleware } from "@/lib/middleware/run-middleware";
import { uploadFile } from "@/lib/config/upload";
import { prisma } from "@/lib/prisma";

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const config = {
  api: {
    bodyParser: false, // Disable built-in body cleaner for multipart/form-data
  },
};

export default async function handler(req: any, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 1. Verify Authentication & Role
    const authUser = await verifyAuth(req as NextApiRequest, res);
    if (!authUser || authUser.role !== "teacher") {
      return res.status(403).json({ message: "Forbidden: Teacher access required" });
    }

    // 2. Validate Teacher Record
    const teacher = await prisma.teacher.findFirst({
      where: { userId: authUser.id },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher record not found" });
    }

    // 3. Run Multer Middleware
    await runMiddleware(req, res, upload.single("file"));

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;
    const originalName = file.originalname;
    const folder = `homework/attachments/${teacher.id}`;

    // 4. Upload to Cloudinary
    // Using 'auto' allows Cloudinary to detect image vs raw (PDF/Docs)
    const uploadResult = await uploadFile(file.buffer, folder, "auto", originalName);

    return res.status(200).json({
      message: "File uploaded successfully",
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      fileName: originalName
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}
