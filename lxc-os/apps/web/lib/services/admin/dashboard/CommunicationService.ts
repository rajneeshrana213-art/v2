
import { prisma } from "@/lib/prisma";
import { UserType } from "@prisma/client";

export class CommunicationService {
    // notices
    static async createNotice(data: any) {
        return prisma.notice.create({
            data: {
                title: data.title,
                message: data.message,
                noticeDate: data.noticeDate ? new Date(data.noticeDate) : new Date(),
                publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
                attachment: data.attachment,
                createdById: data.createdById,
                schoolId: data.schoolId,
                recipients: {
                    create: data.recipients.map((userType: string) => ({ userType: userType as UserType })),
                },
            },
            include: { recipients: true, creator: true }
        });
    }

    static async getNotices(schoolId?: string) {
        return prisma.notice.findMany({
            where: schoolId ? { schoolId } : {},
            include: { recipients: true, creator: true },
            orderBy: { createdAt: "desc" }
        });
    }

    static async getNoticeById(id: string) {
        return prisma.notice.findUnique({
            where: { id },
            include: { recipients: true, creator: true }
        });
    }

    static async updateNotice(id: string, data: any) {
        // Clear existing recipients if updating
        if (data.recipients) {
            await prisma.noticeRecipient.deleteMany({ where: { noticeId: id } });
        }
        
        return prisma.notice.update({
            where: { id },
            data: {
                title: data.title,
                message: data.message,
                noticeDate: data.noticeDate ? new Date(data.noticeDate) : undefined,
                publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
                attachment: data.attachment,
                recipients: data.recipients ? {
                    create: data.recipients.map((userType: string) => ({ userType: userType as UserType }))
                } : undefined
            },
            include: { recipients: true, creator: true }
        });
    }

    static async deleteNotice(id: string) {
        return prisma.notice.delete({ where: { id } });
    }

    // announcements
    static async createAnnouncement(data: any) {
        return prisma.announcement.create({
            data: {
                title: data.title,
                description: data.description,
                date: data.date,
                classId: data.classId
            }
        });
    }

    static async getAnnouncements() {
        return prisma.announcement.findMany();
    }

    static async getAnnouncementById(id: string) {
        return prisma.announcement.findUnique({ where: { id } });
    }

    static async updateAnnouncement(id: string, data: any) {
        return prisma.announcement.update({ where: { id }, data });
    }

    static async deleteAnnouncement(id: string) {
        return prisma.announcement.delete({ where: { id } });
    }
}
