import { PrismaClient, ActiveStatus, UserSex } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { triggerNotification } from "@/lib/services/notification/notification-service";
import { NotificationTrigger } from "@prisma/client";
import { renderAndSendEmail } from "@/lib/utils/mailer";
import { CONFIG } from "@/lib/config";
import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";
import { FeeEngineService } from "../finance/FeeEngineService";

// Type for transaction client
type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// Interface for student creation data
export interface StudentCreationData {
  // User fields
  email: string;
  phone: string;
  userName?: string;
  name: string;
  sex: string;
  bloodType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  profilePicUrl: string | null;

  // Student fields
  academicYear: string;
  admissionNo?: string;
  admissionDate: string | Date;
  rollNo: string;
  status?: string;
  dateOfBirth: string | Date;
  Religion: string;
  category: string;
  caste: string;
  motherTongue: string;
  languagesKnown: string;

  // Parent fields
  fatherName: string;
  fatheremail?: string | null;
  fatherPhone: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation?: string | null;
  motherEmail?: string | null;
  motherPhone: string;

  // Guardian fields
  guardianName: string;
  guardianRelation: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianOccupation: string;
  guardianAddress: string;

  // Sibling fields
  areSiblingStudying: string;
  siblingName: string;
  siblingClass: string;
  siblingRollNo: string;
  siblingAdmissionNo: string;

  // Address fields
  currentAddress: string;
  permanentAddress: string;

  // Optional fields
  vehicleNumber?: string | null;
  hostelName?: string | null;
  roomNumber?: string | null;
  medicalCondition: string;
  allergies: string;
  medicationName: string;
  schoolName?: string | null;
  medicalCertificateUrl: string;
  transferCertificateUrl: string;

  // Relations
  schoolId: string;
  classId: string;
  section?: string | null;
  skipEmail?: boolean;
  skipLimitCheck?: boolean;
  prefetchedData?: {
    schoolName?: string;
    className?: string;
  };
}

export interface StudentCreationResult {
  student: any;
  studentUser: any;
  parent: any;
  parentUser: any;
  studentUserName: string;
  tempStudentPassword: string;
  tempParentPassword: string | null;
  generatedAdmissionNo: string;
  parentUserName: string | null;
  schoolName: string;
}

// Helper to extract initials from school name
function getSchoolInitials(schoolName: string): string {
  return schoolName
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

// Helper to format admission number using school initials
function formatAdmissionNo(initials: string, seq: number): string {
  const padded = String(seq).padStart(3, "0");
  return `${initials}-${padded}`;
}

export class StudentCreationService {
  /**
   * Creates a student, user, and parent in a transaction
   */
  static async createStudentWithParent(
    tx: TxClient,
    data: StudentCreationData,
  ): Promise<StudentCreationResult> {
    // 0) Enforce Enrollment Limits & Billing Rules
    await SubscriptionService.validateUserLimit(data.schoolId);
    await SubscriptionService.checkWriteAccess(data.schoolId);

    // Generate temporary passwords
    const tempStudentPassword = randomBytes(6).toString("hex");
    const hashedStudentPassword = await bcrypt.hash(tempStudentPassword, 10);

    // 1) Generate student username if not provided
    let studentUserName = data.userName;
    if (!studentUserName) {
      // Generate unique student username
      let baseUsername = data.name
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
      if (baseUsername.length > 15)
        baseUsername = baseUsername.substring(0, 15);
      if (!baseUsername) baseUsername = "student";

      studentUserName = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

      // Ensure uniqueness
      let attempts = 0;
      while (attempts < 100) {
        const existingUser = await tx.user.findUnique({
          where: { userName: studentUserName },
        });
        if (!existingUser) break;
        studentUserName = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
        attempts++;
      }
    }

    // 2) Create student user
    const studentUser = await tx.user.create({
      data: {
        name: data.name,
        sex: data.sex as any,
        email: data.email,
        phone: data.phone,
        userName: studentUserName,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        bloodType: data.bloodType,
        password: hashedStudentPassword,
        role: "student",
        profilePic: data.profilePicUrl,
        schoolId: data.schoolId,
      },
    });

    // 2) Fetch school to get name
    let schoolName = data.prefetchedData?.schoolName;
    if (!schoolName) {
      const school = await tx.school.findUnique({
        where: { id: data.schoolId },
        select: { id: true, schoolName: true },
      });
      if (!school) throw new Error("School not found");
      schoolName = school.schoolName;
    }

    if (!schoolName) throw new Error("School name not found");

    const initials = getSchoolInitials(schoolName);
    const academicYearKey =
      data.academicYear || new Date().getFullYear().toString();

    // 4) Use provided admission number or generate a unique one
    let generatedAdmissionNo = data.admissionNo?.trim();

    if (!generatedAdmissionNo) {
      const count = await tx.student.count({
        where: { schoolId: data.schoolId },
      });

      let sequence = count + 1;
      generatedAdmissionNo = formatAdmissionNo(initials, sequence);

      // Conflict check for auto-generated number
      const existingWithSameNo = await tx.student.findFirst({
        where: { schoolId: data.schoolId, admissionNo: generatedAdmissionNo },
        select: { id: true },
      });

      if (existingWithSameNo) {
        const highestStudent = await tx.student.findFirst({
          where: {
            schoolId: data.schoolId,
            admissionNo: { startsWith: `${initials}-` },
          },
          orderBy: { admissionNo: "desc" },
          select: { admissionNo: true },
        });

        if (highestStudent?.admissionNo) {
          const match = highestStudent.admissionNo.match(/-(\d+)$/);
          if (match) sequence = parseInt(match[1], 10) + 1;
        }
        generatedAdmissionNo = formatAdmissionNo(initials, sequence);
      }
    } else {
      // If admission number is provided, check if it already exists for this school
      const existingProvidedNo = await tx.student.findFirst({
        where: { schoolId: data.schoolId, admissionNo: generatedAdmissionNo },
        select: { id: true },
      });
      if (existingProvidedNo) {
        throw new Error(
          `Admission Number "${generatedAdmissionNo}" already exists in this school.`,
        );
      }
    }

    // 4.5) Resolve section name to ID if needed
    let resolvedSectionId = data.section;
    if (resolvedSectionId) {
      // First try as a direct ID match (cuid)
      const sectionById = await tx.section.findUnique({
        where: { id: resolvedSectionId },
        select: { id: true },
      });

      if (!sectionById) {
        // Not a valid ID, try to find by name for the given class
        const sectionByName = await tx.section.findFirst({
          where: {
            classId: data.classId,
            name: { equals: resolvedSectionId, mode: "insensitive" },
          },
          select: { id: true },
        });

        if (sectionByName) {
          resolvedSectionId = sectionByName.id;
        } else {
          // Try removing "Section" prefix if present
          const normalizedName = resolvedSectionId
            .replace(/^section\s+/i, "")
            .trim();
          const sectionByNormalizedName = await tx.section.findFirst({
            where: {
              classId: data.classId,
              name: { equals: normalizedName, mode: "insensitive" },
            },
            select: { id: true },
          });
          resolvedSectionId = sectionByNormalizedName
            ? sectionByNormalizedName.id
            : null;
        }
      }
    }

    // 5) Create student record
    const student = await tx.student.create({
      data: {
        user: { connect: { id: studentUser.id } },
        admissionNo: generatedAdmissionNo,
        admissionDate: new Date(data.admissionDate),
        status: (data.status as any) || "ACTIVE",
        dateOfBirth: new Date(data.dateOfBirth),
        Religion: data.Religion || "N/A",
        category: data.category || "General",
        caste: data.caste || "General",
        motherTongue: data.motherTongue || "N/A",
        languagesKnown: data.languagesKnown || "N/A",
        fatherName: data.fatherName || "N/A",
        fatheremail: data.fatheremail ?? null,
        fatherPhone: data.fatherPhone || "N/A",
        fatherOccupation: data.fatherOccupation || "N/A",
        motherName: data.motherName || "N/A",
        motherOccupation: data.motherOccupation ?? null,
        motherEmail: data.motherEmail ?? null,
        motherPhone: data.motherPhone || "N/A",
        guardianName: data.guardianName || "N/A",
        guardianRelation: data.guardianRelation || "Guardian",
        guardianEmail: data.guardianEmail,
        guardianPhone: data.guardianPhone || "N/A",
        guardianOccupation: data.guardianOccupation || "N/A",
        guardianAddress: data.guardianAddress || "N/A",
        areSiblingStudying: data.areSiblingStudying || "No",
        siblingName: data.siblingName || "N/A",
        siblingClass: data.siblingClass || "N/A",
        siblingRollNo: data.siblingRollNo || "N/A",
        siblingAdmissionNo: data.siblingAdmissionNo || "N/A",
        currentAddress: data.currentAddress || "N/A",
        permanentAddress: data.permanentAddress || data.currentAddress || "N/A",
        vehicleNumber: data.vehicleNumber ?? null,
        medicalCondition: data.medicalCondition || "None",
        allergies: data.allergies || "None",
        medicationName: data.medicationName || "None",
        schoolName: data.schoolName ?? null,
        address: data.address || data.currentAddress || "N/A",
        medicalCertificate: data.medicalCertificateUrl || "N/A",
        transferCertificate: data.transferCertificateUrl || "N/A",
        school: { connect: { id: data.schoolId } },
        class: { connect: { id: data.classId } },
        academicRecords: {
          create: {
            classId: data.classId,
            sectionId: resolvedSectionId ?? null,
            academicYear: academicYearKey,
            rollNumber: data.rollNo,
          },
        },
      },
    });

    // --- FINANCIAL ENGINE INTEGRATION ---
    // 6) Automatically assign Fee Structure based on Class
    const activeAcademicYear = await tx.academicYear.findFirst({
      where: {
        schoolId: data.schoolId,
        year: academicYearKey,
        isActive: true,
      },
    });

    if (activeAcademicYear) {
      const classFeeStructure = await tx.feeStructure.findFirst({
        where: {
          schoolId: data.schoolId,
          academicYearId: activeAcademicYear.id,
          classId: data.classId,
          isActive: true,
        },
        include: {
          feeHeadAmounts: true,
        },
      });

      if (classFeeStructure) {
        // Create student-specific fee plan
        const feePlan = await tx.studentFeePlan.create({
          data: {
            schoolId: data.schoolId,
            academicYearId: activeAcademicYear.id,
            studentId: student.id,
            feeStructureId: classFeeStructure.id,
            isActive: true,
            feeHeadAmounts: {
              create: classFeeStructure.feeHeadAmounts.map((h) => ({
                feeHeadId: h.feeHeadId,
                amount: h.amount,
              })),
            },
          },
        });

        // Trigger the financial engine to generate installments/invoices
        await FeeEngineService.syncStudentFeePlan(
          student.id,
          activeAcademicYear.id,
          data.schoolId,
          tx as any,
        );
      }
    }
    // ------------------------------------

    // 5) Check for existing parent user by email (regardless of role)
    const existingParentUser = await tx.user.findUnique({
      where: { email: data.guardianEmail },
      include: { parent: true },
    });

    let parent;
    let parentUser;
    let tempParentPassword: string | null = null;
    let parentUserName: string | null = null;

    if (!existingParentUser) {
      // User doesn't exist, create both user and parent profile
      tempParentPassword = randomBytes(6).toString("hex");
      const hashedParentPassword = await bcrypt.hash(tempParentPassword, 10);

      // Generate unique parent username
      // Clean the name: lowercase, remove spaces and special characters, limit length
      let baseUsername = data.guardianName
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
      // Limit base username to 15 characters to leave room for suffix
      if (baseUsername.length > 15) {
        baseUsername = baseUsername.substring(0, 15);
      }
      // If base is empty after cleaning, use a default
      if (!baseUsername || baseUsername.length === 0) {
        baseUsername = "parent";
      }

      let generatedParentUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

      // Ensure uniqueness
      let attempts = 0;
      while (attempts < 100) {
        const existingUser = await tx.user.findUnique({
          where: { userName: generatedParentUsername },
        });
        if (!existingUser) break;
        // Try with different random suffix
        generatedParentUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
        attempts++;
      }

      if (attempts >= 100) {
        // Fallback: use timestamp if we can't find a unique username
        generatedParentUsername = `${baseUsername}${Date.now().toString().slice(-6)}`;
      }

      parentUserName = generatedParentUsername;

      parentUser = await tx.user.create({
        data: {
          name: data.guardianName,
          email: data.guardianEmail,
          phone: data.guardianPhone,
          userName: parentUserName,
          sex: data.sex as any,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          bloodType: data.bloodType,
          password: hashedParentPassword,
          role: "parent",
          schoolId: data.schoolId,
        },
      });

      parent = await tx.parent.create({
        data: {
          role: "parent",
          user: { connect: { id: parentUser.id } },
          students: { connect: { id: student.id } },
        },
      });
    } else {
      // User exists, get their username
      parentUser = existingParentUser;
      parentUserName = existingParentUser.userName;

      // User exists. Ensure they have a parent profile.
      if (!existingParentUser.parent) {
        // User exists (maybe as teacher/admin) but has no parent profile
        parent = await tx.parent.create({
          data: {
            role: "parent",
            user: { connect: { id: existingParentUser.id } },
            students: { connect: { id: student.id } },
          },
        });
      } else {
        // User already has a parent profile, just connect the student
        parent = await tx.parent.update({
          where: { id: existingParentUser.parent.id },
          data: { students: { connect: { id: student.id } } },
        });
      }
    }

    // 7) Connect student to parent ID
    await tx.user.update({
      where: { id: studentUser.id },
      data: { studentId: student.id },
    });

    await tx.user.update({
      where: { id: parent.userId! },
      data: { parentId: parent.id },
    });

    return {
      student,
      studentUser,
      parent,
      parentUser,
      studentUserName,
      tempStudentPassword,
      tempParentPassword: !existingParentUser ? tempParentPassword : null,
      generatedAdmissionNo,
      parentUserName,
      schoolName: schoolName,
    };
  }

  static async createStudentWithParentWithRetry(
    data: StudentCreationData,
  ): Promise<StudentCreationResult> {
    const MAX_ATTEMPTS = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const result = await prisma.$transaction(
          async (tx) => {
            return await this.createStudentWithParent(tx as TxClient, data);
          },
          { timeout: 150000, maxWait: 100000 },
        );

        // Get school and class information for emails (avoid query if pre-fetched)
        let schoolName = data.prefetchedData?.schoolName;
        let className = data.prefetchedData?.className;

        if (!data.skipEmail && (!schoolName || !className)) {
          const [schoolInfo, classInfo] = await Promise.all([
            schoolName
              ? Promise.resolve({ schoolName })
              : prisma.school.findUnique({
                  where: { id: data.schoolId },
                  select: { schoolName: true },
                }),
            className
              ? Promise.resolve({ name: className })
              : prisma.class.findUnique({
                  where: { id: data.classId },
                  select: { name: true },
                }),
          ]);
          schoolName = schoolInfo?.schoolName;
          className = classInfo?.name;
        }

        const loginUrl = CONFIG.FRONTEND_BASE_URL
          ? `${CONFIG.FRONTEND_BASE_URL}/login`
          : process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
            : "http://localhost:3000/login";

        // Send email notifications
        try {
          if (!data.skipEmail) {
            // Send email to student
            if (result.tempStudentPassword) {
              renderAndSendEmail(
                "student-credentials",
                {
                  studentName: data.name,
                  schoolName: schoolName || "Your School",
                  email: data.email,
                  userName: result.studentUserName,
                  password: result.tempStudentPassword,
                  admissionNo: result.generatedAdmissionNo,
                  rollNo: data.rollNo,
                  loginUrl: loginUrl,
                },
                "Welcome to LearnXChain - Your Student Account Credentials",
                data.email,
              ).catch((e) => console.error("Background Student Email Error:", e));
            }

            // Send email to parent (only if new parent was created)
            if (result.tempParentPassword) {
              renderAndSendEmail(
                "parent-credentials",
                {
                  parentName: data.guardianName,
                  schoolName: schoolName || "Your School",
                  email: data.guardianEmail,
                  userName: result.parentUserName,
                  password: result.tempParentPassword,
                  studentName: data.name,
                  admissionNo: result.generatedAdmissionNo,
                  rollNo: data.rollNo,
                  loginUrl: loginUrl,
                },
                "Welcome to LearnXChain - Your Parent Account Credentials",
                data.guardianEmail,
              ).catch((e) => console.error("Background Parent Email Error:", e));
            }
          }

          // Also send notification system messages (if configured)
          if (!data.skipEmail) {
            try {
              triggerNotification({
                triggerEvent: NotificationTrigger.STUDENT_REGISTRATION,
                schoolId: data.schoolId,
                data: {
                  recipient: data.email,
                  name: data.name,
                  admissionNo: result.generatedAdmissionNo,
                  userName: result.studentUserName, // Use generated username
                  password: result.tempStudentPassword || null,
                  role: "student",
                },
              }).catch((e) => console.error("Background Notification Error (Student):", e));

              if (result.tempParentPassword) {
                triggerNotification({
                  triggerEvent: NotificationTrigger.STUDENT_REGISTRATION,
                  schoolId: data.schoolId,
                  data: {
                    recipient: data.guardianEmail,
                    name: data.guardianName,
                    studentName: data.name,
                    admissionNo: result.generatedAdmissionNo,
                    userName: result.parentUserName || data.guardianEmail,
                    password: result.tempParentPassword,
                    role: "parent",
                  },
                }).catch((e) => console.error("Background Notification Error (Parent):", e));
              }
            } catch (notifError: any) {
              console.error(
                "Failed to send registration notifications:",
                notifError?.message || notifError,
              );
              // Don't fail the whole registration if notifications fail
            }
          }
        } catch (emailError) {
          console.error("Failed to send registration emails:", emailError);
          // Don't fail the whole registration if emails fail
        }

        return result;
      } catch (error: any) {
        lastError = error;
        if (error?.code === "P2002" && attempt < MAX_ATTEMPTS) {
          continue;
        }
        break;
      }
    }
    throw lastError || new Error("Failed to create student");
  }
}
