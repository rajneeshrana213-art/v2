import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export class AccommodationService {
  static async createRequest(data: { studentId: string; hostelId: string }) {
    return prisma.accommodationRequest.create({
      data: {
        id: uuidv4(),
        student_id: data.studentId,
        hostel_id: data.hostelId,
        status: RequestStatus.PENDING,
      },
    });
  }

  static async updateRequestStatus(id: string, status: RequestStatus) {
    return prisma.accommodationRequest.update({
      where: { id },
      data: { status },
    });
  }

  static async getRequestById(id: string) {
    return prisma.accommodationRequest.findUnique({
      where: { id },
      include: {
        Student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  static async getRequests(filters?: { studentId?: string }) {
    return prisma.accommodationRequest.findMany({
      where: {
        ...(filters?.studentId && { student_id: filters.studentId }),
      },
      include: {
        Student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  static async deleteRequest(id: string) {
    return prisma.accommodationRequest.delete({
      where: { id },
    });
  }
}
