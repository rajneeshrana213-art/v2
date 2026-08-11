import { prisma } from "@/lib/prisma";

export class GuardianService {
  static async getGuardiansOfSchool(schoolId: string) {
    // Legacy logic fetches guardians from Student model fields
    return prisma.student.findMany({
      where: { schoolId },
      select: {
        id: true,
        guardianName: true,
        guardianRelation: true,
        guardianEmail: true,
        guardianPhone: true,
        guardianOccupation: true,
        guardianAddress: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  static async getGuardianOfStudent(studentId: string) {
    return prisma.student.findUnique({
      where: { id: studentId },
      select: {
        guardianName: true,
        guardianRelation: true,
        guardianEmail: true,
        guardianPhone: true,
        guardianOccupation: true,
        guardianAddress: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  static async updateGuardian(
    studentId: string,
    data: {
      guardianName: string;
      guardianRelation: string;
      guardianEmail: string;
      guardianPhone: string;
      guardianOccupation: string;
      guardianAddress: string;
    },
  ) {
    return prisma.student.update({
      where: { id: studentId },
      data,
    });
  }

  static async clearGuardianInfo(studentId: string) {
    return prisma.student.update({
      where: { id: studentId },
      data: {
        guardianName: "",
        guardianRelation: "",
        guardianEmail: "",
        guardianPhone: "",
        guardianOccupation: "",
        guardianAddress: "",
      },
    });
  }

  static async getStudentsByAuthenticatedGuardian(guardianUserId: string) {
    // Authentic guardian (Parent model) logic
    const parent = await prisma.parent.findUnique({
      where: { userId: guardianUserId },
      include: {
        user: true,
        students: {
          include: {
            class: { select: { id: true, name: true } },
            user: { select: { name: true, email: true, phone: true } },
            academicRecords: {
              where: {
                // Only fetch the active year's record if necessary, or just grab the latest
                // You can add academicYear filter here if passed to the function
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!parent || !parent.user) {
      throw new Error("Guardian not found");
    }

    return {
      guardianEmail: parent.user.email,
      totalStudents: parent.students.length,
      students: parent.students.map((student) => ({
        id: student.id,
        admissionNo: student.admissionNo,
        rollNo: student.academicRecords?.[0]?.rollNumber || "",
        dateOfBirth: student.dateOfBirth,
        classId: student.class?.id,
        className: student.class?.name,
        studentName: student.user.name,
        studentEmail: student.user.email,
        studentPhone: student.user.phone,
      })),
    };
  }
}
