import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { TicketStatus, TicketPriority, Role } from '@prisma/client';
import multer from 'multer';
import { runMiddleware } from '@/lib/middleware/run-middleware';
import { uploadFile } from '@/lib/config/upload';

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser for Multer
  },
};

export default async function handler(req: any, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (user.role !== Role.admin && user.role !== Role.superadmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const schoolId = user.schoolId;
  if (!schoolId && user.role !== Role.superadmin) {
    return res.status(400).json({ message: 'User not associated with a school' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, schoolId);
  } else if (req.method === 'POST') {
    return handlePost(req, res, user);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, schoolId: string | null) {
  try {
    // Re-enable bodyParser logic briefly if needed, but for GET it's usually fine
    const { page = '1', limit = '10', search = '', status, priority } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (schoolId) {
      where.schoolId = schoolId;
    }

    if (search) {
      const searchNum = parseInt(search as string);
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        ...(isNaN(searchNum) ? [] : [{ ticketNumber: { equals: searchNum } }]),
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status as TicketStatus;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority as TicketPriority;
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              name: true,
              email: true,
              profilePic: true,
            },
          },
          employee: {
            include: {
              user: {
                select: {
                  name: true,
                  profilePic: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return res.status(200).json({
      data: tickets,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: any, res: NextApiResponse, user: any) {
  try {
    await runMiddleware(req, res, upload.array('attachments', 5));

    const { title, description, category, priority } = req.body;
    const files = req.files as any[];

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const uploadedUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadResult = await uploadFile(file.buffer, 'support-tickets', 'auto', file.originalname);
          uploadedUrls.push(uploadResult.url);
        } catch (uploadError) {
          console.error('Error uploading file to Cloudinary:', uploadError);
        }
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        category,
        priority: (priority as TicketPriority) || TicketPriority.LOW,
        status: TicketStatus.OPEN,
        schoolId: user.schoolId,
        userId: user.id,
        attachment: uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null,
      },
    });

    return res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
