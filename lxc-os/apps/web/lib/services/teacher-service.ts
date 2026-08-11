import { prisma } from "@/lib/prisma";
import { ActiveStatus, MaritalStatus, UserSex } from "@prisma/client";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { uploadFile } from "@/lib/config/upload";
import { sendEmail } from "@/lib/services/notification";
import { renderAndSendEmail } from "@/lib/utils/mailer";
import { CONFIG } from "@/lib/config";

// Helper: build readable code
function formatTeacherId(code: string, seq: number) {
  const padded = String(seq).padStart(3, "0");
  return `${code}-${padded}`;
}

export interface RegisterTeacherInput {
  // User Info
  name: string;
  userName: string;
  sex: UserSex;
  email: string;
  phone: string;
  bloodType: string;

  // School
  schoolId: string;
  teacherSchoolId?: string;

  // Dates
  dateofJoin: Date | string;
  dateOfBirth: Date | string;

  // Personal & Family
  fatherName: string;
  motherName: string;
  maritalStatus: MaritalStatus;

  // Professional
  languagesKnown: string;
  qualification: string;
  workExperience: string;
  previousSchool: string;
  previousSchoolAddress: string;
  previousSchoolPhone: string;
  panNumber?: string;

  // Employment
  status?: "Active" | "Inactive" | "Suspended";
  salary: number;
  contractType?: string;
  dateOfPayment?: Date | string;

  // Leaves
  medicalLeave?: string;
  casualLeave?: string;
  maternityLeave?: string;
  sickLeave?: string;

  // Bank
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName: string;

  // Hostel/Transport
  hostelName?: string;
  roomNumber?: string;

  // Social
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;

  // Address
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;

  // Files
  profilePicBuffer: Buffer;
  profilePicName: string;
  resumeBuffer: Buffer;
  resumeName: string;
  joiningLetterBuffer: Buffer;
  joiningLetterName: string;
}

export const registerTeacherService = async (data: RegisterTeacherInput) => {
  // 1. Files Upload
  const [resumeUpload, joiningLetterUpload, profilePicUpload] =
    await Promise.all([
      uploadFile(data.resumeBuffer, "resumes", "raw", data.resumeName),
      uploadFile(
        data.joiningLetterBuffer,
        "joining_letters",
        "raw",
        data.joiningLetterName,
      ),
      uploadFile(
        data.profilePicBuffer,
        "profile_pics",
        "image",
        data.profilePicName,
      ),
    ]);

  // 2. Password
  const tempPassword = randomBytes(6).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // 3. Status Map
  let activeStatus: ActiveStatus = ActiveStatus.ACTIVE;
  if (data.status === "Inactive") activeStatus = "INACTIVE" as ActiveStatus;
  if (data.status === "Suspended") activeStatus = "SUSPENDED" as ActiveStatus;

  const MAX_ATTEMPTS = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          // Create User
          const teacherUser = await tx.user.create({
            data: {
              name: data.name,
              sex: data.sex,
              email: data.email,
              phone: data.phone,
              bloodType: data.bloodType,
              address: data.address,
              city: data.city,
              userName: data.userName,
              state: data.state,
              country: data.country,
              pincode: data.pincode,
              role: "teacher",
              schoolId: data.schoolId,
              profilePic: profilePicUpload.url,
              password: hashedPassword,
            },
          });

          // Get School Code
          const school = await tx.school.findUnique({
            where: { id: data.schoolId },
            select: { id: true, schoolCode: true },
          });
          if (!school) throw new Error("School not found");

          const code = school.schoolCode
            ? school.schoolCode.slice(0, 6)
            : String(school.id).slice(0, 6);

          const count = await tx.teacher.count({
            where: { schoolId: data.schoolId },
          });
          const nextSeq = count + 1;
          const generatedTeacherSchoolId = formatTeacherId(code, nextSeq);

          // Create Teacher
          const teacher = await tx.teacher.create({
            data: {
              user: { connect: { id: teacherUser.id } },
              teacherSchoolId: generatedTeacherSchoolId,
              dateofJoin: new Date(data.dateofJoin),
              fatherName: data.fatherName,
              maritalStatus: data.maritalStatus,
              languagesKnown: data.languagesKnown,
              qualification: data.qualification,
              workExperience: data.workExperience,
              previousSchool: data.previousSchool,
              previousSchoolAddress: data.previousSchoolAddress,
              previousSchoolPhone: data.previousSchoolPhone,
              motherName: data.motherName,
              dateOfBirth: new Date(data.dateOfBirth),
              panNumber: data.panNumber,
              status: activeStatus,
              salary: data.salary,
              contractType: data.contractType,
              dateOfPayment: data.dateOfPayment
                ? new Date(data.dateOfPayment)
                : null,

              medicalLeave: data.medicalLeave,
              casualLeave: data.casualLeave,
              maternityLeave: data.maternityLeave,
              sickLeave: data.sickLeave,

              bankName: data.bankName,
              accountNumber: data.accountNumber,
              ifscCode: data.ifscCode,
              branchName: data.branchName,

              hostelName: data.hostelName,
              roomNumber: data.roomNumber,

              facebook: data.facebook,
              twitter: data.twitter,
              linkedin: data.linkedin,
              instagram: data.instagram,
              youtube: data.youtube,

              faceImage: profilePicUpload.url,
              Resume: resumeUpload.url,
              joiningLetter: joiningLetterUpload.url,
              school: { connect: { id: data.schoolId } },
            },
          });

          await tx.user.update({
            where: { id: teacherUser.id },
            data: { teacherId: teacher.id },
          });

          return {
            teacher,
            user: teacherUser,
            generatedTeacherSchoolId,
            tempPassword,
          };
        },
        { timeout: 150000 },
      );

      // Send Email (Non-blocking usually, but await/catch here)
      try {
        // Fetch school name for email
        const school = await prisma.school.findUnique({
          where: { id: data.schoolId },
          select: { schoolName: true },
        });

        const loginUrl = CONFIG.FRONTEND_BASE_URL
          ? `${CONFIG.FRONTEND_BASE_URL}/login`
          : process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
            : "http://localhost:3000/login";

        await renderAndSendEmail(
          "teacher-credentials",
          {
            teacherName: data.name,
            schoolName: school?.schoolName || "",
            email: data.email,
            userName: result.user.userName || data.email,
            password: result.tempPassword,
            teacherSchoolId: result.generatedTeacherSchoolId,
            loginUrl: loginUrl,
          },
          "Welcome to LearnXChain - Your Teacher Account Credentials",
          data.email,
        );
      } catch (e) {
        console.error("Teacher email failed", e);
      }

      return result;
    } catch (err: any) {
      lastError = err;
      if (err?.code === "P2002" && attempt < MAX_ATTEMPTS) {
        continue;
      }
      throw err;
    }
  }
};
