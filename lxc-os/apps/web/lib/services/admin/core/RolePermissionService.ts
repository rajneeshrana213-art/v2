import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export class RolePermissionService {
  /**
   * Get all users in a school who can have shared permissions (Teachers, Staff, etc.)
   * Excludes Students and Parents.
   */
  static async getSharableUsers(schoolId: string) {
    return prisma.user.findMany({
      where: {
        schoolId,
        role: {
          notIn: [Role.student, Role.parent, Role.superadmin],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePic: true,
        Employee: {
          select: {
            employeeCode: true,
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        },
        userPermissions: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Update or Create permissions for a user
   */
  static async updateUserPermissions(userId: string, permissions: { moduleName: string; modulePermission: string }[]) {
    return prisma.$transaction(async (tx) => {
      // First, delete existing permissions for this user to ensure clean state
      // (Optional: depending on if we want to update selectively or replace all)
      // Usually, for a fully-fledged role sharing, replacing is cleaner for the UI's Save button.
      await tx.userPermissions.deleteMany({
        where: { userId },
      });

      // Then create the new ones
      if (permissions.length > 0) {
        return tx.userPermissions.createMany({
          data: permissions.map((p) => ({
            userId,
            moduleName: p.moduleName,
            modulePermission: p.modulePermission,
            status: 1,
          })),
        });
      }
      
      return { count: 0 };
    });
  }
}
