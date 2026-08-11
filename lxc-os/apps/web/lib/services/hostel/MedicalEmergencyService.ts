import { prisma } from "@/lib/prisma";

export class MedicalEmergencyService {
  static async createEmergency(data: {
    description: string;
    date: Date;
    studentId: string;
    hostelId: string;
  }) {
    return prisma.medicalEmergency.create({
      data: {
        description: data.description,
        date: data.date,
        studentId: data.studentId,
        hostelId: data.hostelId,
      },
    });
  }

  static async updateEmergency(id: string, data: {
    description?: string;
    date?: Date;
    studentId?: string;
    hostelId?: string;
  }) {
    return prisma.medicalEmergency.update({
      where: { id },
      data,
    });
  }

  static async getEmergencyById(id: string) {
    return prisma.medicalEmergency.findUnique({
      where: { id },
      include: {
        Student: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });
  }

  static async getAllEmergencies() {
    return prisma.medicalEmergency.findMany({
      include: {
        Student: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async deleteEmergency(id: string) {
    return prisma.medicalEmergency.delete({
      where: { id },
    });
  }
}
