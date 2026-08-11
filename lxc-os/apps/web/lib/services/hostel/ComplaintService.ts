import { prisma } from "@/lib/prisma";
import { ComplaintStatus } from "@prisma/client";

export class ComplaintService {
  static async createComplaint(data: { description: string; studentId: string; hostelId: string }) {
    return await prisma.complaint.create({
      data: {
        description: data.description,
        student_id: data.studentId,
        hostel_id: data.hostelId,
      },
    });
  }

  static async updateComplaint(id: string, data: { status?: ComplaintStatus; description?: string }) {
    return await prisma.complaint.update({
      where: { id },
      data,
    });
  }

  static async getComplaintById(id: string) {
    return await prisma.complaint.findUnique({
      where: { id },
    });
  }

  static async getAllComplaints() {
    return await prisma.complaint.findMany();
  }

  static async deleteComplaint(id: string) {
    return await prisma.complaint.delete({
      where: { id },
    });
  }
  
  static async deleteAllComplaints() {
      return await prisma.complaint.deleteMany();
  }
}
