import { prisma } from "../../prisma";

export const getParentsBySchool = async (schoolId: string, page: number = 1, limit: number = 10) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const where = {
    students: {
      some: {
        schoolId: schoolId,
      },
    },
  };

  const [parents, total] = await Promise.all([
    prisma.parent.findMany({
      where,
      include: {
        user: true,
        students: {
          where: {
            schoolId: schoolId,
          },
          include: {
            user: true,
            class: true,
          },
        },
      },
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.parent.count({ where }),
  ]);

  return {
    parents,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
};

export const getParentById = async (id: string) => {
  return await prisma.parent.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          user: true,
          class: true,
        },
      },
      user: true,
    },
  });
};

export const getChildrenByParent = async (parentId: string) => {
  const parent = await prisma.parent.findUnique({
    where: {
      id: parentId,
    },
    include: {
      students: true,
      user: true,
    },
  });

  if (!parent) {
    throw new Error("Parent not found");
  }

  return {
    parent: {
      id: parent.id,
      user: parent.user,
    },
    children: parent.students,
  };
};

export const deleteParent = async (id: string) => {
  return await prisma.parent.delete({
    where: { id },
  });
};
