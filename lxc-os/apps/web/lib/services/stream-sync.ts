import { getStreamClient } from "../stream-client";
import { prisma } from "../prisma";
import { Role } from "@prisma/client";

interface StreamUserData {
  id: string;
  name: string;
  image?: string | null;
  role: string;
  schoolId?: string | null;
  classIds?: string[];
}

/**
 * Syncs or updates a user in Stream Chat
 * Called on login/signup to ensure user exists in Stream
 */
export const syncStreamUser = async (userId: string): Promise<void> => {
  try {
    const streamClient = getStreamClient();

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            class: true,
          },
        },
        teacher: {
          include: {
            classes: true,
          },
        },
        parent: {
          include: {
            students: {
              include: {
                class: true,
              },
            },
          },
        },
        school: true,
      },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Get class IDs based on role
    let classIds: string[] = [];
    if (user.role === Role.student && user.student) {
      classIds = user.student.classId ? [user.student.classId] : [];
    } else if (user.role === Role.teacher && user.teacher) {
      classIds = user.teacher.classes.map((c) => c.id);
    } else if (user.role === Role.parent && user.parent) {
      // Get unique class IDs from all children
      const uniqueClassIds = new Set(
        user.parent.students
          .map((s) => s.classId)
          .filter((id): id is string => !!id),
      );
      classIds = Array.from(uniqueClassIds);
    }

    const roleMap: Record<string, string> = {
      superadmin: "superadmin",
      admin: "admin",
      teacher: "teacher",
      student: "student",
      parent: "parent",
    };

    const streamRole = roleMap[user.role] || "user";

    // Prepare user data for Stream
    const streamUser: StreamUserData = {
      id: user.id,
      name: user.name,
      image: user.profilePic || undefined,
      role: streamRole,
      schoolId: user.schoolId || undefined,
      classIds: classIds.length > 0 ? classIds : undefined,
    };

    // Upsert user in Stream
    await streamClient.upsertUser({
      id: streamUser.id,
      name: streamUser.name,
      image: streamUser.image ?? undefined,
      role: streamUser.role,
    });

    // console.log(`[Stream] Synced user ${userId} (${streamRole})`);
  } catch (error) {
    console.error(`[Stream] Error syncing user ${userId}:`, error);
  }
};

export const updateStreamUser = async (userId: string): Promise<void> => {
  await syncStreamUser(userId);
};
