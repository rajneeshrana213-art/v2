import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export class OutpassService {
  static async createRequest(data: {
    studentId: string;
    reason: string;
    fromDate: Date;
    toDate: Date;
  }) {
    return prisma.outpassRequest.create({
      data: {
        id: uuidv4(),
        student_id: data.studentId,
        reason: data.reason,
        from_date: data.fromDate,
        to_date: data.toDate,
        status: RequestStatus.PENDING,
      },
    });
  }

  static async updateRequest(id: string, data: {
    studentId?: string;
    reason?: string;
    fromDate?: Date;
    toDate?: Date;
    status?: string;
  }) {
    return prisma.outpassRequest.update({
      where: { id },
      data: {
        student_id: data.studentId,
        reason: data.reason,
        from_date: data.fromDate,
        to_date: data.toDate,
        status: data.status as RequestStatus,
      },
    });
  }

  static async getRequestById(id: string) {
    return prisma.outpassRequest.findUnique({
      where: { id },
    });
  }

  static async getRequestsByStudentId(studentId: string) {
    return prisma.outpassRequest.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: "desc" },
    });
  }

  static async getAllRequests() {
    return prisma.outpassRequest.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  static async deleteRequest(id: string) {
    return prisma.outpassRequest.delete({
      where: { id },
    });
  }
}
