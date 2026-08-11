import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getAllModuleMetadata, getModuleMetadata, ISidebarPermission } from "@/lib/module-metadata";
import { IUserPermission } from "@/lib/types";

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error("Unauthorized access: No userId found");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        Employee: {
          select: {
            id: true,
            employeeCode: true,
            employeeType: true,
            status: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            designation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      employee: user.Employee || null,
    };
  } catch (error: any) {
    console.error(`Error in getUserProfile for userId ${userId}:`, error);
    throw new Error(error.message || "An unknown error occurred");
  }
};

// Get user permissions
export const getUserPermissions = async (userId: string) => {
  try {
    const userObj = await prisma.user.findUnique({ where: { id: userId } });
    if (!userObj) throw new Error("Invalid request");

    let permissionList = await prisma.userPermissions.findMany({ 
        where: { userId } 
    });

    const rolesWithDefaultPermissions = [
      Role.student,
      Role.teacher,
      Role.parent,
      Role.hostel,
      Role.library,
      Role.employee,
      Role.driver,
    ];

    // If no permissions in DB, and role is in default allowed list
    if (permissionList.length === 0 && rolesWithDefaultPermissions.includes(userObj.role as any)) {
      const modules = ["library", "hostel", "transport", "academics", "accounts", "exam", "communication"];

      // Create dummy permission objects (not saving to DB, just returning)
      permissionList = modules.map((moduleName, index) => ({
        id: index, 
        createdAt: new Date(),
        updatedAt: new Date(),
        guid: "",
        userId: userObj.id,
        moduleName,
        modulePermission: "11111", // Full permission
        status: 1,
      }));
    }

    // If still empty and not admin
    if (permissionList.length === 0 && userObj.role !== Role.admin && userObj.role !== Role.superadmin) {
      // throw new Error("You don't have any permissions. Please contact admin");
      // Don't throw, just return empty to avoid breaking UI
    }

    const returnPermissionList: IUserPermission = {};

    for (let i = 0; i < permissionList.length; i++) {
      const permissionObj = permissionList[i];
      const allPermissions = permissionObj.modulePermission.split("").map((value) => parseInt(value));

      returnPermissionList[`${permissionObj.moduleName}Module`] = {
        access: allPermissions.includes(1),
        permissions: {
          create: allPermissions[0],
          read: allPermissions[1],
          update: allPermissions[2],
          delete: allPermissions[3],
          managePermissions: allPermissions[4],
        },
      };
    }

    return {
      permissions: returnPermissionList,
    };
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// Get lightweight sidebar permissions
export const getSidebarPermissions = async (userId: string): Promise<{ permissions: ISidebarPermission[] }> => {
  try {
    const userObj = await prisma.user.findUnique({ where: { id: userId } });
    if (!userObj) throw new Error("Invalid request");

    // For superadmin, return all modules
    if (userObj.role === Role.superadmin) {
      const allModules = getAllModuleMetadata().map((meta) => ({
        ...meta,
        visible: true,
      }));
      return { permissions: allModules };
    }

    let permissionList = await prisma.userPermissions.findMany({ 
        where: { userId } 
    });

    const rolesWithDefaultPermissions = [
      Role.student,
      Role.teacher,
      Role.parent,
      Role.hostel,
      Role.library,
      Role.employee,
      Role.transport,
      Role.driver,
    ];

    if (permissionList.length === 0 && rolesWithDefaultPermissions.includes(userObj.role as any)) {
      const isTransportRole = userObj.role === Role.transport || userObj.role === Role.driver;
      const modules = isTransportRole
        ? ["transport"]
        : ["library", "hostel", "transport", "academics", "accounts", "exam", "communication"];

      permissionList = modules.map((moduleName, index) => ({
        id: `dummy-${index}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        guid: "",
        userId: userObj.id,
        moduleName,
        modulePermission: "11111",
        status: 1,
      })) as any;
    }

    const sidebarPermissions: ISidebarPermission[] = [];

    for (const permissionObj of permissionList) {
      const allPermissions = permissionObj.modulePermission.split("").map((value) => parseInt(value));
      const hasAccess = allPermissions.includes(1);
      const isVisible = hasAccess && permissionObj.status === 1;

      const metadata = getModuleMetadata(permissionObj.moduleName);
      if (metadata) {
        sidebarPermissions.push({
          ...metadata,
          visible: isVisible,
        });
      }
    }

    // Always add UserManagementModule and VisitorModule for admin
    if (userObj.role === Role.admin) {
      const userMgmtMeta = getModuleMetadata("peoples");
      if (userMgmtMeta) {
        sidebarPermissions.push({
          moduleKey: "UserManagementModule",
          moduleName: "User Management",
          icon: "ti ti-users",
          route: "/user-management",
          visible: true,
        });
      }

      const visitorMeta = getModuleMetadata("visitor");
      if (visitorMeta && !sidebarPermissions.some((p) => p.moduleKey === "VisitorModule")) {
        sidebarPermissions.push({
          ...visitorMeta,
          visible: true,
        });
      }
    }

    if (
      (userObj.role === Role.transport || userObj.role === Role.driver) &&
      !sidebarPermissions.some((p) => p.moduleKey === "TransportModule")
    ) {
      const transportMeta = getModuleMetadata("transport");
      if (transportMeta) {
        sidebarPermissions.push({
          ...transportMeta,
          visible: true,
        });
      }
    }

    return { permissions: sidebarPermissions };
  } catch (err: any) {
    throw new Error(err.message);
  }
};
