import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';
import { uploadFile } from '@/lib/config/upload';
import upload from '@/lib/middleware/multer';
import { runMiddleware } from '@/lib/middleware/run-middleware';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface NextApiRequestWithFile extends NextApiRequest {
  file?: any;
}

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  const user = await verifyAuth(req, res);
  if (!user || user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
  }

  try {
    if (req.method === 'GET') {
        const { page = '1', limit = '10', search = '', status, priority, employeeId } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (search) {
        where.OR = [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
            { ticketNumber: { equals: parseInt(search as string) || undefined } },
        ];
        }

        if (status && status !== 'ALL') {
          if (status === 'UNASSIGNED') {
            where.employeeId = null;
          } else {
            where.status = status as TicketStatus;
          }
        }

        if (priority && priority !== 'ALL') {
          where.priority = priority as TicketPriority;
        }
        
        // Filter for unassigned tickets if specifically requested via boolean
        if (req.query.unassigned === 'true') {
            where.employeeId = null;
        } else if (employeeId) {
           where.employeeId = employeeId as string;
        }


        const [tickets, total, summaryCounts] = await Promise.all([
          prisma.ticket.findMany({
              where,
              include: {
                User: {
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
          Promise.all([
            prisma.ticket.count(), // all
            prisma.ticket.count({ where: { status: 'OPEN' } }),
            prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.ticket.count({ where: { status: 'RESOLVED' } }),
            prisma.ticket.count({ where: { status: 'CLOSED' } }),
            prisma.ticket.count({ where: { status: 'CANCELLED' } }), // Added cancelled
            prisma.ticket.count({ where: { employeeId: null } }) // unassigned
          ]).then(([all, open, inProgress, resolved, closed, cancelled, unassigned]) => ({
            all,
            open,
            inProgress,
            resolved,
            closed,
            cancelled,
            unassigned
          }))
        ]);

        return res.status(200).json({
        data: tickets,
        pagination: {
            total,
            pages: Math.ceil(total / limitNum),
            page: pageNum,
            limit: limitNum,
            },
        summaryCounts
        });
    }

    if (req.method === 'POST') {
        await runMiddleware(req, res, upload.single('attachment'));

        const { title, description, category, priority, employeeId } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const file = req.file;
        let attachmentUrl: string | undefined;

        if (file) {
            const fileType = file.mimetype.startsWith('image/') ? 'image' : 'raw';
            try {
                const uploaded = await uploadFile(
                    file.buffer,
                    'support_tickets',
                    fileType,
                    file.originalname
                );
                attachmentUrl = uploaded.url;
            } catch (err) {
                console.error("File upload failed:", err);
                // Continue without attachment or return error? 
                // In employee/create.ts it returns 500.
                return res.status(500).json({ error: "File upload failed" });
            }
        }

        const ticketData: any = {
            title,
            description,
            category,
            priority: (priority as TicketPriority) || TicketPriority.LOW,
            status: TicketStatus.OPEN,
            userId: user.id, // Super Admin is the creator
            attachment: attachmentUrl
        };

        if (employeeId) {
            ticketData.employeeId = employeeId;
        }

        const ticket = await prisma.ticket.create({
            data: ticketData,
            include: {
                User: {
                    select: { name: true, email: true, profilePic: true }
                },
                employee: {
                    include: {
                        user: { select: { name: true, profilePic: true } }
                    }
                }
            }
        });

        return res.status(201).json(ticket);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
