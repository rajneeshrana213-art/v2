import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { uploadFile } from "@/lib/config/upload";
import { sendEmail } from "@/lib/services/notification";
import { renderAndSendEmail } from "@/lib/utils/mailer";
import { CONFIG } from "@/lib/config";
// Note: You may need to create a specific sendRegistrationEmail helper in notification service if logic is custom

// Helper to format admission number
function formatAdmissionNo(initials: string, seq: number) {
  return `${initials}-${String(seq).padStart(3, "0")}`;
}

export function getSchoolInitials(schoolName: string): string {
  return schoolName
    .split(/\s+/)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// Generate unique admission no and username
export async function allocateAdmissionNo(
  tx: any, // Prisma Transaction Client
  schoolId: string,
  initials: string,
  academicYear: string,
): Promise<{ admissionNo: string; userName: string }> {
  const COUNTER_KEY = "GLOBAL_SEQ";
  const MAX_INNER_ATTEMPTS = 500;
  let innerAttempts = 0;
  let found = false;
  let result = { admissionNo: "", userName: "" };
  let lastTried = "";

  const totalSchoolStudents = await tx.student.count({
    where: { schoolId },
  });

  let counter = await tx.admissionCounter.upsert({
    where: { schoolId_academicYear: { schoolId, academicYear: COUNTER_KEY } },
    create: {
      schoolId,
      academicYear: COUNTER_KEY,
      nextSeq: totalSchoolStudents + 1,
    },
    update: {},
  });

  if (counter.nextSeq <= totalSchoolStudents) {
    counter = await tx.admissionCounter.update({
      where: { schoolId_academicYear: { schoolId, academicYear: COUNTER_KEY } },
      data: { nextSeq: totalSchoolStudents + 1 },
    });
  }

  while (!found && innerAttempts < MAX_INNER_ATTEMPTS) {
    innerAttempts++;

    counter = await tx.admissionCounter.update({
      where: { schoolId_academicYear: { schoolId, academicYear: COUNTER_KEY } },
      data: { nextSeq: { increment: 1 } },
    });

    const seqString = String(counter.nextSeq).padStart(3, "0");
    const userName = formatAdmissionNo(initials, counter.nextSeq);
    const admissionNo = `${academicYear}-${userName}`;

    result = { admissionNo, userName };
    lastTried = `${admissionNo} / ${userName}`;

    const [existingStudent, existingUser] = await Promise.all([
      tx.student.findFirst({
        where: { schoolId, admissionNo: admissionNo },
        select: { id: true },
      }),
      tx.user.findFirst({
        where: { userName: userName },
        select: { id: true },
      }),
    ]);

    if (!existingStudent && !existingUser) {
      found = true;
    }
  }

  if (!found || !result.admissionNo) {
    throw new Error(
      `Unable to generate unique IDs after ${innerAttempts} attempts. Last tried: ${lastTried}`,
    );
  }

  return result;
}

export const getAllStudents = async (schoolId: string) => {
  return await prisma.student.findMany({
    where: { schoolId },
    include: {
      user: true,
      class: true,
      parent: {
        include: {
          user: true,
        },
      },
    },
  });
};

// Interface for Register Student Input
// This matches the validation schema largely, but with file buffers
export interface RegisterStudentInput {
  // School & Class
  schoolId: string;
  classId: string;
  academicYear?: string;
  admissionDate: string | Date;
  rollNo: string;
  status?: any; // ActiveStatus enum

  // Student Personal
  name: string;
  email: string;
  phone: string;
  sex: any; // UserSex enum
  dateOfBirth: string | Date;
  bloodType: string;
  Religion: string;
  category: string;
  caste: string;
  motherTongue: string;
  languagesKnown: string;

  // Parents
  fatherName: string;
  fatheremail?: string;
  fatherPhone: string;
  fatherOccupation?: string;
  motherName: string;
  motherEmail?: string;
  motherPhone: string;
  motherOccupation?: string;

  // Guardian
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianRelation: string;
  guardianOccupation?: string;
  guardianAddress?: string;

  // Address
  currentAddress: string;
  permanentAddress: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;

  // Medical
  medicalCondition?: string;
  allergies?: string;
  medicationName?: string;

  // Siblings
  areSiblingStudying?: any;
  siblingName?: string;
  siblingClass?: string;
  siblingRollNo?: string;
  siblingAdmissionNo?: string;

  // Transport/Hostel
  vehicleNumber?: string;
  hostelName?: string;
  roomNumber?: string;

  // Files (Buffers)
  profilePicBuffer: Buffer;
  profilePicName: string;
  medicalCertificateBuffer: Buffer;
  medicalCertificateName: string;
  transferCertificateBuffer: Buffer;
  transferCertificateName: string;

  // Other
  schoolName?: string; // Often derived
}

export const registerStudentService = async (data: RegisterStudentInput) => {
  // 1. School Check
  const school = await prisma.school.findUnique({
    where: { id: data.schoolId },
    select: { id: true, schoolName: true },
  });
  if (!school) throw new Error("School not found");
  const initials = getSchoolInitials(school.schoolName);

  // 2. Subscription Check
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      schoolId: data.schoolId,
      isActive: true,
      endDate: { gte: new Date() },
    },
  });
  if (!activeSubscription) throw new Error("No active subscription found.");

  const currentStudentCount = await prisma.student.count({
    where: { schoolId: data.schoolId },
  });
  if (
    activeSubscription.userLimit !== null &&
    currentStudentCount >= activeSubscription.userLimit
  ) {
    throw new Error("Student limit reached for subscription plan.");
  }

  // 3. Upload Files
  const [
    profilePicUpload,
    medicalCertificateUpload,
    transferCertificateUpload,
  ] = await Promise.all([
    uploadFile(
      data.profilePicBuffer,
      "profile_pics",
      "image",
      data.profilePicName,
    ),
    uploadFile(
      data.medicalCertificateBuffer,
      "medical_certificate",
      "raw",
      data.medicalCertificateName,
    ),
    uploadFile(
      data.transferCertificateBuffer,
      "transfer_letters",
      "raw",
      data.transferCertificateName,
    ),
  ]);

  // 4. Passwords
  const tempStudentPassword = randomBytes(6).toString("hex");
  const hashedStudentPassword = await bcrypt.hash(tempStudentPassword, 10);

  // Potential parent password
  const tempParentPasswordPotential = randomBytes(6).toString("hex");
  const hashedParentPasswordPotential = await bcrypt.hash(
    tempParentPasswordPotential,
    10,
  );

  const academicYearKey =
    data.academicYear || new Date().getFullYear().toString();

  // 5. Transaction
  const MAX_ATTEMPTS = 5;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await prisma.$transaction(async (tx: any) => {
        // Validate roll number - same roll number cannot exist in same class
        if (data.classId && data.rollNo) {
          const existingStudentWithRollNo =
            await tx.studentAcademicRecord.findFirst({
              where: {
                classId: data.classId,
                academicYear: academicYearKey,
                rollNumber: data.rollNo,
              },
              select: { id: true, rollNumber: true },
            });

          if (existingStudentWithRollNo) {
            throw new Error(
              `A student with roll number ${data.rollNo} already exists in this class. Please use a different roll number.`,
            );
          }
        }

        // Find existing parent
        const existingParentUser = await tx.user.findFirst({
          where: { email: data.guardianEmail, role: "parent" },
          include: { parent: true },
        });

        // Generate ID
        const { admissionNo, userName } = await allocateAdmissionNo(
          tx,
          data.schoolId,
          initials,
          academicYearKey,
        );

        // Create Student User
        const studentUser = await tx.user.create({
          data: {
            name: data.name,
            sex: data.sex,
            email: data.email,
            phone: data.phone,
            userName: userName,
            address: data.address || data.currentAddress,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
            bloodType: data.bloodType,
            password: hashedStudentPassword,
            role: "student",
            schoolId: data.schoolId,
            profilePic: profilePicUpload.url,
          },
        });

        // Resolve section name to ID if needed
        let resolvedSectionId = (data as any).section || (data as any).sectionId;
        if (resolvedSectionId) {
          const sectionById = await tx.section.findUnique({
            where: { id: resolvedSectionId },
            select: { id: true }
          });

          if (!sectionById) {
            const sectionByName = await tx.section.findFirst({
              where: {
                classId: data.classId,
                name: { equals: resolvedSectionId, mode: 'insensitive' }
              },
              select: { id: true }
            });

            if (sectionByName) {
              resolvedSectionId = sectionByName.id;
            } else {
              const normalizedName = resolvedSectionId.replace(/^section\s+/i, "").trim();
              const sectionByNormalizedName = await tx.section.findFirst({
                where: {
                  classId: data.classId,
                  name: { equals: normalizedName, mode: 'insensitive' }
                },
                select: { id: true }
              });
              resolvedSectionId = sectionByNormalizedName ? sectionByNormalizedName.id : null;
            }
          }
        }

        // Create Student Record
        const student = await tx.student.create({
          data: {
            user: { connect: { id: studentUser.id } },
            academicYear: academicYearKey,
            admissionNo: admissionNo,
            admissionDate: new Date(data.admissionDate), // Ensure Date
            dateOfBirth: new Date(data.dateOfBirth),
            Religion: data.Religion,
            category: data.category,
            caste: data.caste,
            motherTongue: data.motherTongue,
            languagesKnown: data.languagesKnown,

            fatherName: data.fatherName,
            fatheremail: data.fatheremail || null,
            fatherPhone: data.fatherPhone,
            fatherOccupation: data.fatherOccupation,

            motherName: data.motherName,
            motherEmail: data.motherEmail || null,
            motherPhone: data.motherPhone,
            motherOccupation: data.motherOccupation || null,

            guardianName: data.guardianName,
            guardianRelation: data.guardianRelation,
            guardianEmail: data.guardianEmail,
            guardianPhone: data.guardianPhone,
            guardianOccupation: data.guardianOccupation,
            guardianAddress: data.guardianAddress,

            areSiblingStudying:
              data.areSiblingStudying === "true" ||
              data.areSiblingStudying === true, // Handle string 'true' from formData
            siblingName: data.siblingName,
            siblingClass: data.siblingClass,
            siblingRollNo: data.siblingRollNo,
            siblingAdmissionNo: data.siblingAdmissionNo,

            currentAddress: data.currentAddress,
            permanentAddress: data.permanentAddress,
            address: data.address,

            vehicleNumber: data.vehicleNumber,
            hostelName: data.hostelName,
            roomNumber: data.roomNumber,

            medicalCondition: data.medicalCondition,
            allergies: data.allergies,
            medicationName: data.medicationName,

            schoolName: school.schoolName,

            medicalCertificate: medicalCertificateUpload.url,
            transferCertificate: transferCertificateUpload.url,

            school: { connect: { id: data.schoolId } },
            class: { connect: { id: data.classId } },
            academicRecords: {
              create: {
                classId: data.classId,
                sectionId: resolvedSectionId || null,
                academicYear: academicYearKey,
                rollNumber: data.rollNo,
              },
            },
          },
        });

        // Handle Parent
        let parent;
        let actualTempParentPassword: string | null = null;

        if (!existingParentUser) {
          // New Parent
          actualTempParentPassword = tempParentPasswordPotential;

          const parentUser = await tx.user.create({
            data: {
              name: data.guardianName,
              email: data.guardianEmail,
              phone: data.guardianPhone,
              sex: data.sex, // Assume same sex? Or default? Probably male/female based on guardian relation
              // But data.sex is student sex.
              // Creating generic parent user, maybe omit specific sex or default 'Other'
              role: "parent",
              password: hashedParentPasswordPotential,
              schoolId: data.schoolId,
              address: data.address || data.currentAddress,
              city: data.city,
              state: data.state,
              country: data.country,
              pincode: data.pincode,
            },
          });

          parent = await tx.parent.create({
            data: {
              role: "parent",
              user: { connect: { id: parentUser.id } },
              students: { connect: { id: student.id } },
            },
          });

          await tx.user.update({
            where: { id: parentUser.id },
            data: { parentId: parent.id },
          });
        } else {
          // Existing Parent
          if (!existingParentUser.parent) {
            // Edge case: User exists as parent role but no parent record? Recover
            // Or throw
            throw new Error("Parent record missing for existing parent user");
          }

          parent = await tx.parent.update({
            where: { id: existingParentUser.parent.id },
            data: {
              students: { connect: { id: student.id } },
            },
          });
        }

        // Update user links
        await tx.user.update({
          where: { id: studentUser.id },
          data: { studentId: student.id },
        });

        return {
          student,
          parent,
          generatedAdmissionNo: admissionNo,
          tempStudentPassword,
          tempParentPassword: actualTempParentPassword,
        };
      });

      // If successful transaction

      // Send Emails (Non-blocking)
      // Note: In Next.js Serverless, we should await this or use an external queue
      // But for simple migration, we'll await with catch to not fail request
      try {
        const loginUrl = CONFIG.FRONTEND_BASE_URL
          ? `${CONFIG.FRONTEND_BASE_URL}/login`
          : process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
            : "http://localhost:3000/login";

        // Get student user info for username
        const studentUserInfo = await prisma.user.findFirst({
          where: { email: data.email, role: "student" },
          select: { userName: true },
        });

        // Send email to student
        await renderAndSendEmail(
          "student-credentials",
          {
            studentName: data.name,
            schoolName: school.schoolName,
            email: data.email,
            userName: studentUserInfo?.userName || data.email,
            password: result.tempStudentPassword,
            admissionNo: result.generatedAdmissionNo,
            rollNo: data.rollNo,
            loginUrl: loginUrl,
          },
          "Welcome to LearnXChain - Your Student Account Credentials",
          data.email,
        );

        // Send email to parent
        if (result.tempParentPassword) {
          // Get parent user info for username
          const parentUser = await prisma.user.findFirst({
            where: { email: data.guardianEmail, role: "parent" },
            select: { userName: true },
          });

          await renderAndSendEmail(
            "parent-credentials",
            {
              parentName: data.guardianName,
              schoolName: school.schoolName,
              email: data.guardianEmail,
              userName: parentUser?.userName || data.guardianEmail,
              password: result.tempParentPassword,
              studentName: data.name,
              admissionNo: result.generatedAdmissionNo,
              rollNo: data.rollNo,
              loginUrl: loginUrl,
            },
            "Welcome to LearnXChain - Your Parent Account Credentials",
            data.guardianEmail,
          );
        } else {
          // Parent already exists, just notify them
          const loginUrl =
            CONFIG.FRONTEND_BASE_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            "http://localhost:3000";
          await renderAndSendEmail(
            "child-added",
            {
              childName: data.name,
              loginUrl,
            },
            "Child Added to Your Account",
            data.guardianEmail,
          );
        }
      } catch (emailErr) {
        console.error("Email sending failed", emailErr);
      }

      return result;
    } catch (err: any) {
      lastError = err;
      if (err?.code === "P2002" && attempt < MAX_ATTEMPTS) {
        // Unique constraint failed, likely admissionNo race condition
        continue;
      }
      throw err;
    }
  }
};
