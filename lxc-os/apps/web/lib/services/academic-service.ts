import { prisma } from "@/lib/prisma";
import { ActiveStatus } from "@prisma/client";

// --- Class Services ---

export const createClassService = async (data: {
  name: string;
  capacity: number;
  schoolId: string;
  roomNumber?: string;
}) => {
  const school = await prisma.school.findUnique({
    where: { id: data.schoolId },
  });
  if (!school) throw new Error("School not found");

  return await prisma.class.create({
    data: {
      name: data.name,
      capacity: data.capacity,
      roomNumber: data.roomNumber,
      school: { connect: { id: data.schoolId } },
    },
  });
};

export const getClassesBySchoolId = async (schoolId: string) => {
  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: {
      Section: true,
      _count: {
        select: {
          students: true,
          Teacher: true,
        },
      },
    },
  });

  // Helper to sort classes intelligently (copied from controller logic)
  const normalizeRaw = (name: string) =>
    name.toUpperCase().replace(/\./g, "").replace(/CLASS/g, "").trim();

  const getSortOrder = (name: string): number => {
    const n = normalizeRaw(name);
    if (n === "PRENURSERY") return 1;
    if (n === "NURSERY") return 2;
    if (n === "LKG") return 3;
    if (n === "UKG") return 4;
    const num = parseInt(n, 10);
    return !isNaN(num) ? 100 + num : 999;
  };

  return classes
    .map((cls) => ({
      ...cls,
      studentCount: cls._count.students,
      teacherCount: cls._count.Teacher,
      sortOrder: getSortOrder(cls.name),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

export const assignTeacherToClass = async (
  classId: string,
  teacherId: string,
) => {
  return await prisma.class.update({
    where: { id: classId },
    data: {
      Teacher: { connect: { id: teacherId } },
    },
  });
};

// --- Section Services ---

export const createSectionService = async (data: {
  name: string;
  classId: string;
}) => {
  const schoolClass = await prisma.class.findUnique({
    where: { id: data.classId },
  });
  if (!schoolClass) throw new Error("Class not found");

  const section = await prisma.section.create({
    data: {
      name: data.name,
      class: { connect: { id: data.classId } },
    },
    include: { class: true },
  });

  return { ...section, capacity: section.class?.capacity };
};

export const getSectionsByClassId = async (classId: string) => {
  const sections = await prisma.section.findMany({
    where: { classId },
    include: { class: true },
  });
  return sections.map((s) => ({ ...s, capacity: s.class?.capacity }));
};

// --- Subject Services ---

export const createSubjectService = async (data: {
  name: string;
  code: string;
  type: string;
  classId: string;
  status?: ActiveStatus;
}) => {
  const classData = await prisma.class.findUnique({
    where: { id: data.classId },
    select: { schoolId: true },
  });
  if (!classData) throw new Error("Class not found");

  return await prisma.subject.create({
    data: {
      name: data.name,
      code: data.code,
      type: data.type,
      classId: data.classId,
      schoolId: classData.schoolId,
      status: data.status || "ACTIVE",
    },
  });
};

export const getSubjectsByClassId = async (classId: string) => {
  return await prisma.subject.findMany({
    where: { classId },
    include: { class: true },
  });
};

export const getAllSubjectsOfSchool = async (schoolId: string) => {
  return await prisma.subject.findMany({
    where: { schoolId },
    include: { class: true },
  });
};
