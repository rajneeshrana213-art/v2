
import { prisma } from "@/lib/prisma";

export class SchoolService {
  static async getSchoolInfoByUserId(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { schoolId: true }
    });

    if (!user || !user.schoolId) {
        throw new Error("School not found for this user");
    }

    const school = await prisma.school.findUnique({
        where: { id: user.schoolId },
        select: {
            id: true,
            schoolName: true,
            schoolLogo: true
        }
    });

    if (!school) throw new Error("School details not found");
    
    return {
        schoolId: school.id,
        schoolName: school.schoolName,
        schoolLogo: school.schoolLogo
    };
  }
}
