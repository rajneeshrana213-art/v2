import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/config/upload';
import upload from '@/lib/middleware/multer';
import { runMiddleware } from '@/lib/middleware/run-middleware';
import { submitHomeworkSchema } from '@/lib/validations/student';
import { verifyAuth } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('file'));

    const file = req.file;
    let fileUrl: string | undefined;

    if (file) {
      const fileType = file.mimetype.startsWith('image/') ? 'image' : 'raw';
      try {
        const uploaded = await uploadFile(
          file.buffer,
          'homework_submissions',
          fileType
        );
        fileUrl = uploaded.url;
      } catch (err) {
        console.error("File upload failed:", err);
        return res.status(500).json({ error: "File upload failed" });
      }
    }

    const bodyResult = submitHomeworkSchema.safeParse({
      ...req.body,
      file: fileUrl,
    });

    if (!bodyResult.success) {
      return res.status(400).json({ error: bodyResult.error.errors });
    }

    const { studentId, homeworkId } = bodyResult.data;

    // Check for duplicate submission
    const alreadySubmitted = await prisma.homeworkSubmission.findFirst({
        where: {
            studentId,
            homeworkId,
        },
    });

    if (alreadySubmitted) {
        return res.status(409).json({ error: "Homework already submitted." });
    }

    // Ensure file is provided
    if (!fileUrl) {
      return res.status(400).json({ error: "File is required for submission" });
    }

    // Save the submission
    const submission = await prisma.homeworkSubmission.create({
      data: {
        studentId,
        homeworkId,
        file: fileUrl,
        submittedAt: new Date()
      },
    });

    return res.status(201).json({ success: true, submission });

  } catch (error: any) {
    console.error('Homework submission error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
