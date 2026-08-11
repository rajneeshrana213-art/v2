
import { getStreamClient } from "../../config/stream";
import { prisma } from "../../prisma";
import { Role } from "@prisma/client";

interface StreamUserData {
  id: string;
  name: string;
  image?: string;
  role: string;
  schoolId?: string;
  classIds?: string[];
}

export class SyncService {
  static async syncStreamUser(userId: string): Promise<void> {
    try {
      const streamClient = getStreamClient();

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          student: { include: { class: true } },
          teacher: { include: { classes: true } },
          parent: { include: { students: { include: { class: true } } } },
          school: true,
        },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      let classIds: string[] = [];
      if (user.role === Role.student && user.student) {
        classIds = user.student.classId ? [user.student.classId] : [];
      } else if (user.role === Role.teacher && user.teacher) {
        classIds = user.teacher.classes.map((c) => c.id);
      } else if (user.role === Role.parent && user.parent) {
        const uniqueClassIds = new Set(
          user.parent.students.map((s) => s.classId).filter((id): id is string => !!id)
        );
        classIds = Array.from(uniqueClassIds);
      }

      const roleMap: Record<string, string> = {
        superadmin: 'ADMIN',
        admin: 'ADMIN',
        teacher: 'TEACHER',
        student: 'STUDENT',
        parent: 'PARENT',
      };

      const streamRole = roleMap[user.role] || 'STUDENT';

      const streamUser: StreamUserData = {
        id: user.id,
        name: user.name,
        image: user.profilePic || undefined,
        role: streamRole,
        schoolId: user.schoolId || undefined,
        classIds: classIds.length > 0 ? classIds : undefined,
      };

      await streamClient.upsertUser({
        id: streamUser.id,
        name: streamUser.name,
        image: streamUser.image,
        role: streamUser.role,
      });

      console.log(`[Stream] Synced user ${userId} (${streamRole})`);
    } catch (error) {
      console.error(`[Stream] Error syncing user ${userId}:`, error);
    }
  }

  static async updateStreamUser(userId: string): Promise<void> {
    await this.syncStreamUser(userId);
  }
}
