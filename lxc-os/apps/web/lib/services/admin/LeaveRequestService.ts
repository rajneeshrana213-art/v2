
import { prisma } from "@/lib/prisma";
import { isLeaveApproved, RequestStatus, Role } from "@prisma/client";

export class AdminLeaveRequestService {
    static async getLeaveRequests(schoolId: string, type: 'staff' | 'student') {
        const roles = type === 'student' ? [Role.student] : [
            Role.teacher, 
            Role.staff, 
            Role.employee, 
            Role.account, 
            Role.library, 
            Role.transport, 
            Role.hostel,
            Role.driver,
            Role.academics
        ];

        return prisma.leaveRequest.findMany({
            where: {
                user: {
                    schoolId,
                    role: { in: roles }
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        email: true,
                        phone: true,
                        profilePic: true
                    }
                },
                approver: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async updateLeaveStatus(id: string, data: { status: isLeaveApproved, note?: string, approverId: string }) {
        return prisma.leaveRequest.update({
            where: { id },
            data: {
                isApproved: data.status,
                status: data.status === 'APPROVED' ? RequestStatus.APPROVED : (data.status === 'REJECTED' ? RequestStatus.REJECTED : RequestStatus.PENDING),
                adminNote: data.note,
                approvedBy: data.approverId,
                approvedAt: new Date()
            }
        });
    }

    static async getPendingCounts(schoolId: string) {
        const staffRoles = [
            Role.teacher, Role.staff, Role.employee, Role.account, 
            Role.library, Role.transport, Role.hostel, Role.driver, Role.academics
        ];

        const [staffCount, studentCount] = await Promise.all([
            prisma.leaveRequest.count({
                where: {
                    isApproved: 'PENDING',
                    user: { schoolId, role: { in: staffRoles } }
                }
            }),
            prisma.leaveRequest.count({
                where: {
                    isApproved: 'PENDING',
                    user: { schoolId, role: Role.student }
                }
            })
        ]);

        return { staffCount, studentCount };
    }
}
