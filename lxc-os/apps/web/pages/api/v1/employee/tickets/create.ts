
import { NextApiRequest, NextApiResponse } from 'next';
import { EmployeeService } from "@/lib/services/dashboard/employee-service";
import { uploadFile } from '@/lib/config/upload';
import upload from '@/lib/middleware/multer';
import { runMiddleware } from '@/lib/middleware/run-middleware';
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface NextApiRequestWithFile extends NextApiRequest {
  file?: any;
}

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'employee') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await runMiddleware(req, res, upload.single('attachment'));

    const file = req.file;
    let attachmentUrl: string | undefined;

    if (file) {
      const fileType = file.mimetype.startsWith('image/') ? 'image' : 'raw';
      try {
        const uploaded = await uploadFile(
          file.buffer,
          'employee_tickets',
          fileType,
          file.originalname
        );
        attachmentUrl = uploaded.url;
      } catch (err) {
        console.error("File upload failed:", err);
        return res.status(500).json({ error: "File upload failed" });
      }
    }

    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const ticket = await EmployeeService.createInternalTicket(user.id, {
      title,
      description,
      category,
      priority,
      attachment: attachmentUrl
    });

    return res.status(201).json(ticket);

  } catch (error: any) {
    console.error('Ticket creation error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
