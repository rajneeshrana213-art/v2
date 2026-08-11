import {
  PrismaClient,
  ActiveStatus,
  UserSex,
  MaritalStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { triggerNotification } from "@/lib/services/notification/notification-service";
import { NotificationTrigger } from "@prisma/client";
import { renderAndSendEmail } from "@/lib/utils/mailer";
import { CONFIG } from "@/lib/config";

// Type for transaction client
type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface TeacherCreationData {
  // User fields
  email: string;
  phone: string;
  userName: string;
  name: string;
  sex: UserSex;
  bloodType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  profilePicUrl?: string;

  // Teacher fields
  teacherSchoolId?: string;
  dateofJoin: string | Date;
  fatherName: string;
  motherName: string;
  dateOfBirth: string | Date;
  maritalStatus: MaritalStatus;
  languagesKnown: string;
  qualification: string;
  workExperience: string;
  previousSchool: string;
  previousSchoolAddress: string;
  previousSchoolPhone: string;
  panNumber?: string;
  status?: string;
  salary: number;
  contractType?: string;
  dateOfPayment?: string | Date;
  medicalLeave?: string;
  casualLeave?: string;
  maternityLeave?: string;
  sickLeave?: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  route?: string;
  hostelName?: string;
  roomNumber?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  resumeUrl?: string;
  joiningLetterUrl?: string;

  // Relations
  schoolId: string;
  skipEmail?: boolean;
  skipLimitCheck?: boolean;
  prefetchedData?: {
    schoolName?: string;
  };
}

export interface TeacherCreationResult {
  teacher: any;
  user: any;
  tempPassword: string;
  schoolName: string;
}

export class TeacherCreationService {
  /**
   * Creates a teacher and user in a transaction
   */
  static async createTeacher(
    tx: TxClient,
    data: TeacherCreationData,
  ): Promise<TeacherCreationResult> {
    // Generate temporary password
    const tempPassword = randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 0) Get school initials and next sequence for teacherId and email
    let effectiveSchoolName = data.prefetchedData?.schoolName;
    if (!effectiveSchoolName) {
      const school = await tx.school.findUnique({
        where: { id: data.schoolId },
        select: { schoolName: true },
      });
      effectiveSchoolName = school?.schoolName || "SCH";
    }
    const { getSchoolInitials } = await import("@/lib/utils/school-utils");
    const initials = getSchoolInitials(effectiveSchoolName);
    
    // Lock the school row for this transaction to prevent concurrent processes 
    // from generating the same teacher ID sequence when creating teachers in bulk.
    await tx.$executeRawUnsafe(`SELECT 1 FROM "School" WHERE id = '${data.schoolId}' FOR UPDATE`);
    
    // Use raw query to count ALL teachers, including soft-deleted ones, to avoid reusing IDs
    const countResult: any[] = await tx.$queryRawUnsafe(`SELECT COUNT(*) as exact_count FROM "Teacher" WHERE school_id = '${data.schoolId}'`);
    const teacherCount = Number(countResult[0].exact_count || 0);
    
    const paddedSeq = String(teacherCount + 1).padStart(2, "0");
    const generatedTeacherId = `${initials}-T-${paddedSeq}`;

    // Generate userName if not provided
    const userName =
      data.userName ||
      `${data.name.toLowerCase().replace(/\s+/g, "")}${Math.floor(1000 + Math.random() * 9000)}`;

    // 1) Create teacher user
    const teacherUser = await tx.user.create({
      data: {
        name: data.name,
        sex: data.sex,
        email: data.email,
        phone: data.phone,
        userName: userName,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        bloodType: data.bloodType,
        password: hashedPassword,
        role: "teacher",
        profilePic: data.profilePicUrl,
        schoolId: data.schoolId,
      },
    });

    // 2) Create teacher record
    const teacher = await tx.teacher.create({
      data: {
        user: { connect: { id: teacherUser.id } },
        school: { connect: { id: data.schoolId } },
        teacherSchoolId: data.teacherSchoolId || generatedTeacherId,
        dateofJoin: data.dateofJoin ? new Date(data.dateofJoin) : null,
        fatherName: data.fatherName,
        motherName: data.motherName,
        dateOfBirth: new Date(data.dateOfBirth),
        maritalStatus: data.maritalStatus,
        languagesKnown: data.languagesKnown,
        qualification: data.qualification,
        workExperience: data.workExperience,
        previousSchool: data.previousSchool || "N/A",
        previousSchoolAddress: data.previousSchoolAddress || "N/A",
        previousSchoolPhone: data.previousSchoolPhone || "N/A",
        panNumber: data.panNumber,
        status: (data.status as any) || "ACTIVE",
        salary: data.salary || 0,
        contractType: data.contractType || "Full Time",
        dateOfPayment: data.dateOfPayment ? new Date(data.dateOfPayment) : null,
        medicalLeave: data.medicalLeave,
        casualLeave: data.casualLeave,
        maternityLeave: data.maternityLeave,
        sickLeave: data.sickLeave,
        accountNumber: data.accountNumber || "N/A",
        bankName: data.bankName || "N/A",
        ifscCode: data.ifscCode || "N/A",
        branchName: data.branchName || "N/A",
        route: data.route,
        hostelName: data.hostelName,
        roomNumber: data.roomNumber,
        facebook: data.facebook,
        twitter: data.twitter,
        linkedin: data.linkedin,
        instagram: data.instagram,
        youtube: data.youtube,
        Resume: data.resumeUrl || "",
        joiningLetter: data.joiningLetterUrl || "",
      },
    });

    // 3) Update user with teacherId
    await tx.user.update({
      where: { id: teacherUser.id },
      data: { teacherId: teacher.id },
    });

    return {
      teacher,
      user: teacherUser,
      tempPassword,
      schoolName: effectiveSchoolName,
    };
  }

  static async createTeacherWithRetry(
    data: TeacherCreationData,
  ): Promise<TeacherCreationResult> {
    const MAX_ATTEMPTS = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const result = await prisma.$transaction(
          async (tx) => {
            return await this.createTeacher(tx as TxClient, data);
          },
          { timeout: 15000, maxWait: 10000 },
        );

        // Get school information for email
        let schoolName = data.prefetchedData?.schoolName || result.schoolName;

        if (!data.skipEmail && !schoolName) {
          const school = await prisma.school.findUnique({
            where: { id: data.schoolId },
            select: { schoolName: true },
          });
          schoolName = school?.schoolName || "Your School";
        }

        const loginUrl = CONFIG.FRONTEND_BASE_URL
          ? `${CONFIG.FRONTEND_BASE_URL}/login`
          : process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
            : "http://localhost:3000/login";

        // Send email notification
        try {
          if (!data.skipEmail) {
            await renderAndSendEmail(
              "teacher-credentials",
              {
                teacherName: data.name,
                schoolName: schoolName,
                email: data.email,
                userName: result.user.userName,
                password: result.tempPassword,
                teacherSchoolId: result.teacher.teacherSchoolId,
                loginUrl: loginUrl,
              },
              "Welcome to LearnXChain - Your Teacher Account Credentials",
              data.email,
            );
          }
        } catch (emailError) {
          console.error(
            "Failed to send teacher registration email:",
            emailError,
          );
        }

        // Send notification system messages (if configured)
        if (!data.skipEmail) {
          try {
            await triggerNotification({
              triggerEvent: NotificationTrigger.TEACHER_REGISTRATION,
              schoolId: data.schoolId,
              data: {
                recipient: data.email,
                name: data.name,
                userName: result.user.userName,
                password: result.tempPassword,
                role: "teacher",
              },
            });
          } catch (notifError) {
            console.error(
              "Failed to send teacher registration notifications:",
              notifError,
            );
          }
        }

        return {
          ...result,
          schoolName,
        };
      } catch (error: any) {
        lastError = error;
        if (error?.code === "P2002" && attempt < MAX_ATTEMPTS) {
          continue;
        }
        break;
      }
    }
    throw lastError || new Error("Failed to create teacher");
  }
}
