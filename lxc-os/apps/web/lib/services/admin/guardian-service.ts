import { prisma } from "../../prisma";
import type { Prisma } from "@prisma/client";

export const getAllGuardians = async () => {
  return await prisma.student.findMany({
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
};

export const getGuardianOfStudent = async (studentId: string) => {
  return await prisma.student.findUnique({
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
};

export const getGuardiansOfSchool = async (schoolId: string) => {
  return await prisma.student.findMany({
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
};

export const updateGuardian = async (
  studentId: string,
  data: {
    guardianName?: string;
    guardianRelation?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianOccupation?: string;
    guardianAddress?: string;
  },
) => {
  return await prisma.student.update({
    where: { id: studentId },
    data,
  });
};

export const deleteGuardian = async (studentId: string) => {
  return await prisma.student.update({
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
};

export const getStudentsByAuthenticatedGuardian = async (
  guardianUserId: string,
) => {
  const parent = await prisma.parent.findUnique({
    where: { userId: guardianUserId },
    include: {
      user: true,
      students: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          academicRecords: {
            take: 1,
            select: {
              rollNumber: true,
            },
          },
        },
      },
    },
  });

  if (!parent || !parent.user) {
    throw new Error("Guardian not found");
  }

  const students = parent.students;

  return {
    guardianEmail: parent.user.email,
    totalStudents: students.length,
    students: students.map((student) => ({
      id: student.id,
      admissionNo: student.admissionNo,
      rollNo: student.academicRecords[0]?.rollNumber || "",
      dateOfBirth: student.dateOfBirth,
      classId: student.class?.id,
      className: student.class?.name,
      studentName: student.user.name,
      studentEmail: student.user.email,
      studentPhone: student.user.phone,
    })),
  };
};
