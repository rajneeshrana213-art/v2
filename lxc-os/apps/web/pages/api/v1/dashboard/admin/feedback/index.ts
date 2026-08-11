import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import multer from 'multer';
import { runMiddleware } from '@/lib/middleware/run-middleware';
import { uploadFile } from '@/lib/config/upload';

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for video support
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== Role.admin && user.role !== Role.superadmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method === 'POST') {
    return handlePost(req, res, user);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handlePost(req: any, res: NextApiResponse, user: any) {
  try {
    await runMiddleware(req, res, upload.array('attachments', 3));

    const { title, description } = req.body;
    const files = req.files as any[];

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const uploadedUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadResult = await uploadFile(file.buffer, 'feedback', 'auto', file.originalname);
          uploadedUrls.push(uploadResult.url);
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
        }
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        title,
        description,
        schoolId: user.schoolId as string,
        userId: user.id,
        attachment: uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null,
      },
    });

    return res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
