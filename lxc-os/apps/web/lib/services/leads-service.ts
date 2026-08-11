
import { prisma } from "../prisma";
import logger from "../utils/logger";
import { LeadStatus, DemoStatus } from "@prisma/client";

export const LeadsService = {
  async getLeads(params: {
    userId?: string;
    searchTerm?: string;
    status?: LeadStatus;
    page?: number;
    limit?: number;
  }) {
    const { userId, searchTerm, status, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.assignedToId = userId;
    if (status) where.status = status;
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { schoolName: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    try {
      const [leads, totalCount] = await Promise.all([
        prisma.lead.findMany({
          where,
          include: {
            demos: {
              orderBy: { scheduledAt: 'desc' },
              take: 1
            },
            followUps: {
              orderBy: { scheduledAt: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.lead.count({ where })
      ]);

      const stats = await prisma.lead.groupBy({
        by: ['status'],
        where: userId ? { assignedToId: userId } : {},
        _count: {
          status: true
        }
      });

      return {
        leads,
        pagination: {
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        },
        stats: stats.reduce((acc, curr) => {
          acc[curr.status] = curr._count.status;
          return acc;
        }, { total: totalCount } as any)
      };
    } catch (error) {
      logger.error("Error fetching leads:", error);
      throw error;
    }
  },

  async getLeadById(id: string) {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          demos: {
            orderBy: { scheduledAt: 'desc' },
            include: {
              conductedBy: {
                select: { name: true, email: true }
              }
            }
          },
          followUps: {
            orderBy: { scheduledAt: 'desc' }
          },
          assignedTo: {
            select: { name: true, email: true }
          }
        }
      });
      return lead;
    } catch (error) {
      logger.error("Error fetching lead by ID:", error);
      throw error;
    }
  },

  async createLead(data: {
    name: string;
    schoolName: string;
    phone: string;
    email?: string;
    address?: string;
    source?: string;
    assignedToId?: string;
  }) {
    try {
      const lead = await prisma.lead.create({
        data: {
          ...data,
          status: LeadStatus.NEW
        }
      });
      return lead;
    } catch (error) {
      logger.error("Error creating lead:", error);
      throw error;
    }
  },

  async updateLead(id: string, data: any) {
    try {
      const lead = await prisma.lead.update({
        where: { id },
        data
      });
      return lead;
    } catch (error) {
      logger.error("Error updating lead:", error);
      throw error;
    }
  },

  async deleteLead(id: string) {
    try {
      await prisma.lead.delete({
        where: { id }
      });
      return { success: true };
    } catch (error) {
      logger.error("Error deleting lead:", error);
      throw error;
    }
  },

  async scheduleDemo(leadId: string, data: {
    scheduledAt: Date;
    notes?: string;
    conductedById?: string;
    meetingLink?: string;
  }) {
    const scheduledDate = new Date(data.scheduledAt);
    const now = new Date();
    
    if (scheduledDate < now) {
      throw new Error("Cannot schedule a demo in the past");
    }

    try {
      const [demo] = await prisma.$transaction([
        prisma.demo.create({
          data: {
            leadId,
            scheduledAt: new Date(data.scheduledAt),
            notes: data.notes,
            meetingLink: data.meetingLink,
            conductedById: data.conductedById,
            status: DemoStatus.SCHEDULED
          }
        }),
        prisma.lead.update({
          where: { id: leadId },
          data: { status: LeadStatus.DEMO_SCHEDULED }
        })
      ]);
      return demo;
    } catch (error) {
      logger.error("Error scheduling demo:", error);
      throw error;
    }
  },

  async addFollowUp(leadId: string, data: {
    content: string;
    scheduledAt: Date;
    status?: string;
  }) {
    try {
      const [followUp] = await prisma.$transaction([
        prisma.followUp.create({
          data: {
            leadId,
            content: data.content,
            scheduledAt: new Date(data.scheduledAt),
            isCompleted: false
          }
        }),
        prisma.lead.update({
          where: { id: leadId },
          data: {
            ...(data.status && { status: data.status as any })
          }
        })
      ]);
      return followUp;
    } catch (error) {
      logger.error("Error adding follow-up:", error);
      throw error;
    }
  }
};
