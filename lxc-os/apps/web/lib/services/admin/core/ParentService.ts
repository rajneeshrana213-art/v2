import { prisma } from "@/lib/prisma";

export class ParentService {
  static async getParentsBySchool(schoolId: string) {
    return prisma.parent.findMany({
      where: {
        students: {
          some: {
            schoolId: schoolId,
          },
        },
      },
      include: {
        user: true,
        students: {
          where: { schoolId },
          include: {
            user: true,
            class: true,
          },
        },
      },
    });
  }

  static async getParentById(id: string) {
    return prisma.parent.findUnique({
      where: { id },
      include: {
        students: true,
        user: true,
      },
    });
  }

  static async getChildrenByParent(parentId: string) {
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        students: true,
        user: true,
      },
    });

    if (!parent) return null;

    return {
      parent: {
        id: parent.id,
        user: parent.user,
      },
      children: parent.students,
    };
  }

  static async deleteParent(id: string) {
    return prisma.parent.delete({
      where: { id },
    });
  }
}
