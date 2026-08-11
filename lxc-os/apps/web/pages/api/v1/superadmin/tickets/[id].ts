import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { TicketStatus, TicketPriority } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const authUser = await verifyAuth(req, res);
  if (!authUser || authUser.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }

  if (req.method === 'DELETE') {
      try {
          await prisma.ticket.delete({
              where: { id: id as string },
          });
          return res.status(200).json({ message: 'Ticket deleted successfully' });
      } catch (error) {
          console.error('Error deleting ticket:', error);
          return res.status(500).json({ message: 'Failed to delete ticket' });
      }
  }

  if (req.method !== 'PUT' && req.method !== 'PATCH') { // Support both PUT and PATCH
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { status, priority, employeeId, title, description, category } = req.body;

    const updateData: any = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;

    if (status) {
      updateData.status = status as TicketStatus;
    }

    if (priority) {
      updateData.priority = priority as TicketPriority;
    }

    // Special handling for employee assignment
    // If employeeId is provided as null or undefined explicitly when unassigning, we handle it.
    if (employeeId !== undefined) {
        updateData.employeeId = employeeId;
        
        // Sync assignedToId for the employee
        if (employeeId) {
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: { 
                    userId: true, 
                    user: { 
                        select: { 
                            name: true, 
                            email: true 
                        } 
                    } 
                }
            });

            if (employee) {
                updateData.assignedToId = employee.userId;
            
                // Send assignment email
                 import('@/lib/services/emailService').then(({ sendTicketAssignmentEmail }) => {
                    prisma.ticket.findUnique({
                        where: { id: id as string },
                        select: { ticketNumber: true, title: true, priority: true }
                    }).then(ticketDetails => {
                        if (ticketDetails) {
                            sendTicketAssignmentEmail(
                                employee.user.email,
                                employee.user.name,
                                ticketDetails.ticketNumber.toString(),
                                ticketDetails.title,
                                ticketDetails.priority,
                                id as string
                            );
                        }
                    });
                });
            }

            // AUTO-TRANSITION: If assigning an employee and status is OPEN, move to IN_PROGRESS
            const currentTicket = await prisma.ticket.findUnique({
                where: { id: id as string },
                select: { status: true }
            });
            if (currentTicket?.status === 'OPEN') {
                updateData.status = 'IN_PROGRESS';
            }
        } else {
            // If unassigning, clear assignedToId as well
            updateData.assignedToId = null;
        }
    }

    const ticket = await prisma.ticket.update({
      where: { id: id as string },
      data: updateData,
      include: {
          employee: {
              include: {
                  user: {
                      select: {
                          name: true,
                          profilePic: true
                      }
                  }
              }
          }
      }
    });

    return res.status(200).json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
