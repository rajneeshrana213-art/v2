
import { prisma } from "@/lib/prisma";
import { ActiveStatus, MaritalStatus, UserSex } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";

export class TeacherService {
  static async getAllTeachersBySchool(schoolId: string) {
    return prisma.teacher.findMany({
        where: { schoolId },
        include: {
            user: true,
            school: true,
            lessons: {
                include: { class: true, subject: true }
            }
        }
    });
  }

  static async getTeacherById(id: string) {
    return prisma.teacher.findUnique({
        where: { id },
        include: {
            user: true,
            school: true,
            lessons: {
                include: { class: { include: { Section: true } }, subject: true }
            }
        }
    });
  }

  static async deleteTeacher(id: string) {
    // Legacy logic deletes the user, which cascades to teacher?
    // Controller accesses User model to delete.
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error("Teacher not found");
    
    // We delete the USER and TEACHER associated with this teacher
    return prisma.$transaction([
        prisma.user.delete({ where: { id: teacher.userId } }),
        prisma.teacher.delete({ where: { id } })
    ]);
  }

  static async createTeacher(data: any, files: { resumeUrl: string, joiningLetterUrl: string, profilePicUrl?: string }) {
    // Generate temp password
    const tempPassword = randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const {
        schoolId, name, userName, sex, email, phone, bloodType, address, city, state, country, pincode,
        dateofJoin, fatherName, maritalStatus, languagesKnown, qualification, workExperience,
        previousSchool, previousSchoolAddress, previousSchoolPhone, motherName, dateOfBirth, panNumber, status,
        salary, contractType, dateOfPayment, medicalLeave, casualLeave, maternityLeave, sickLeave,
        bankName, accountNumber, ifscCode, branchName, hostelName, roomNumber,
        facebook, twitter, linkedin, instagram, youtube
    } = data;

    // Retry loop for unique ID generation
    const MAX_ATTEMPTS = 3;
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            // Enforce Subscription Limits & Write Access
            await SubscriptionService.validateUserLimit(schoolId);
            await SubscriptionService.checkWriteAccess(schoolId);

            const result = await prisma.$transaction(async (tx) => {
                // Create User
                const user = await tx.user.create({
                    data: {
                        name, sex: sex as UserSex, email, phone, bloodType, address, city, state, country, pincode,
                        userName, role: "teacher", schoolId, 
                        password: hashedPassword,
                        profilePic: files.profilePicUrl || null
                    }
                });

                // Get School Code
                const school = await tx.school.findUnique({ where: { id: schoolId }, select: { id: true, schoolCode: true } });
                if (!school) throw new Error("School not found");
                
                const code = school.schoolCode ? school.schoolCode.slice(0, 6) : school.id.slice(0, 6);
                
                // Lock the school row to prevent concurrent assignment of the same teacher ID
                await tx.$executeRawUnsafe(`SELECT 1 FROM "School" WHERE id = '${schoolId}' FOR UPDATE`);
                
                // Use raw query to count ALL teachers, including soft-deleted ones, to avoid reusing IDs
                const countResult: any[] = await tx.$queryRawUnsafe(`SELECT COUNT(*) as exact_count FROM "Teacher" WHERE school_id = '${schoolId}'`);
                const count = Number(countResult[0].exact_count || 0);
                
                const teacherSchoolId = `${code}-${String(count + 1).padStart(3, "0")}`;

                // Create Teacher
                const teacher = await tx.teacher.create({
                    data: {
                        user: { connect: { id: user.id } },
                        school: { connect: { id: schoolId } },
                        teacherSchoolId,
                        dateofJoin, fatherName, maritalStatus: maritalStatus as MaritalStatus, languagesKnown,
                        qualification, workExperience, previousSchool, previousSchoolAddress, previousSchoolPhone,
                        motherName, dateOfBirth, panNumber,
                        status: status === "Active" ? ActiveStatus.ACTIVE : status === "Inactive" ? ActiveStatus.INACTIVE : ActiveStatus.SUSPENDED,
                        salary, contractType, dateOfPayment, 
                        medicalLeave, casualLeave, maternityLeave, sickLeave,
                        bankName, accountNumber, ifscCode, branchName,
                        hostelName, roomNumber,
                        facebook, twitter, linkedin, instagram, youtube,
                        faceImage: files.profilePicUrl || null,
                        Resume: files.resumeUrl,
                        joiningLetter: files.joiningLetterUrl
                    }
                });

                // Link back
                await tx.user.update({ where: { id: user.id }, data: { teacherId: teacher.id } });

                return { teacher, user, credentials: { userName, email, password: tempPassword } };
            });
            return result;
        } catch (e: any) {
            lastError = e;
            if (e.code === 'P2002') continue;
            break;
        }
    }
    throw lastError || new Error("Failed to create teacher");
  }

  static async updateTeacher(id: string, data: any, profilePicUrl?: string) {
      const teacher = await prisma.teacher.findUnique({ where: { id } });
      if (!teacher) throw new Error("Teacher not found");

      const updateData: any = { ...data };
      if (profilePicUrl) updateData.profilePic = profilePicUrl;

      // Update User
      await prisma.user.update({
          where: { id: teacher.userId },
          data: updateData
      });

      // Update Teacher image if needed
      if (profilePicUrl) {
          await prisma.teacher.update({
              where: { id },
              data: { faceImage: profilePicUrl }
          });
      }

      return teacher;
  }
}
