import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "../../prisma";

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface StudentCreationData {
  email: string;
  phone: string;
  userName: string;
  name: string;
  sex: string;
  bloodType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  profilePicUrl: string;

  academicYear: string;
  admissionDate: string | Date;
  rollNo: string;
  status?: string;
  dateOfBirth: string | Date;
  Religion: string;
  category: string;
  caste: string;
  motherTongue: string;
  languagesKnown: string;

  fatherName: string;
  fatheremail?: string | null;
  fatherPhone: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation?: string | null;
  motherEmail?: string | null;
  motherPhone: string;

  guardianName: string;
  guardianRelation: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianOccupation: string;
  guardianAddress: string;

  areSiblingStudying: string;
  siblingName: string;
  siblingClass: string;
  siblingRollNo: string;
  siblingAdmissionNo: string;

  currentAddress: string;
  permanentAddress: string;

  vehicleNumber?: string | null;
  hostelName?: string | null;
  roomNumber?: string | null;
  medicalCondition: string;
  allergies: string;
  medicationName: string;
  schoolName?: string | null;
  medicalCertificateUrl: string;
  transferCertificateUrl: string;

  schoolId: string;
  classId: string;
}

export interface StudentCreationResult {
  student: any;
  parent: any;
  tempStudentPassword: string;
  tempParentPassword: string | null;
  generatedAdmissionNo: string;
}

function getSchoolInitials(schoolName: string): string {
  return schoolName
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function formatAdmissionNo(initials: string, seq: number): string {
  const padded = String(seq).padStart(3, "0");
  return `${initials}-${padded}`;
}

export async function createStudentWithParent(
  tx: TxClient,
  data: StudentCreationData,
): Promise<StudentCreationResult> {
  const tempStudentPassword = randomBytes(6).toString("hex");
  const hashedStudentPassword = await bcrypt.hash(tempStudentPassword, 10);

  const studentUser = await tx.user.create({
    data: {
      name: data.name,
      sex: data.sex as any,
      email: data.email,
      phone: data.phone,
      userName: data.userName,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      pincode: data.pincode,
      bloodType: data.bloodType,
      password: hashedStudentPassword,
      role: "student",
      profilePic: data.profilePicUrl,
    },
  });

  const school = await tx.school.findUnique({
    where: { id: data.schoolId },
    select: { id: true, schoolName: true },
  });

  if (!school) {
    throw new Error("School not found");
  }

  const initials = getSchoolInitials(school.schoolName);
  const academicYearKey = data.academicYear
    ? String(data.academicYear)
    : new Date().getFullYear().toString();

  // Validate roll number - same roll number cannot exist in same class
  const existingStudentWithRollNo = await tx.studentAcademicRecord.findFirst({
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

  const count = await tx.student.count({
    where: {
      schoolId: data.schoolId,
    },
  });

  let sequence = count + 1;
  let generatedAdmissionNo = formatAdmissionNo(initials, sequence);

  const existingWithSameNo = await tx.student.findFirst({
    where: {
      schoolId: data.schoolId,
      admissionNo: generatedAdmissionNo,
    },
    select: { id: true },
  });

  if (existingWithSameNo) {
    const highestStudent = await tx.student.findFirst({
      where: {
        schoolId: data.schoolId,
        admissionNo: {
          startsWith: `${initials}-`,
        },
      },
      select: {
        admissionNo: true,
      },
      orderBy: {
        admissionNo: "desc",
      },
    });

    if (highestStudent?.admissionNo) {
      const match = highestStudent.admissionNo.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      } else {
        sequence = count + 1;
      }
    } else {
      sequence = count + 1;
    }
    generatedAdmissionNo = formatAdmissionNo(initials, sequence);
  }

  const student = await tx.student.create({
    data: {
      user: { connect: { id: studentUser.id } },
      admissionNo: generatedAdmissionNo,
      admissionDate:
        typeof data.admissionDate === "string"
          ? new Date(data.admissionDate)
          : data.admissionDate,
      status: (data.status as any) || "ACTIVE",
      dateOfBirth:
        typeof data.dateOfBirth === "string"
          ? new Date(data.dateOfBirth)
          : data.dateOfBirth,
      Religion: data.Religion,
      category: data.category,
      caste: data.caste,
      motherTongue: data.motherTongue,
      languagesKnown: data.languagesKnown,
      fatherName: data.fatherName,
      fatheremail: data.fatheremail ?? null,
      fatherPhone: data.fatherPhone,
      fatherOccupation: data.fatherOccupation,
      motherName: data.motherName,
      motherOccupation: data.motherOccupation ?? null,
      motherEmail: data.motherEmail ?? null,
      motherPhone: data.motherPhone,
      guardianName: data.guardianName,
      guardianRelation: data.guardianRelation,
      guardianEmail: data.guardianEmail,
      guardianPhone: data.guardianPhone,
      guardianOccupation: data.guardianOccupation,
      guardianAddress: data.guardianAddress,
      areSiblingStudying: data.areSiblingStudying,
      siblingName: data.siblingName,
      siblingClass: data.siblingClass,
      siblingRollNo: data.siblingRollNo,
      siblingAdmissionNo: data.siblingAdmissionNo,
      currentAddress: data.currentAddress,
      permanentAddress: data.permanentAddress,
      vehicleNumber: data.vehicleNumber ?? null,
      hostel_name: data.hostelName ?? null,
      room_number: data.roomNumber ?? null,
      medicalCondition: data.medicalCondition,
      allergies: data.allergies,
      medicationName: data.medicationName,
      schoolName: data.schoolName ?? null,
      address: data.address,
      medicalCertificate: data.medicalCertificateUrl,
      transferCertificate: data.transferCertificateUrl,
      school: { connect: { id: data.schoolId } },
      class: { connect: { id: data.classId } },
      academicRecords: {
        create: {
          classId: data.classId,
          academicYear: academicYearKey,
          rollNumber: data.rollNo,
        },
      },
    },
  });

  const existingParentUser = await tx.user.findFirst({
    where: { email: data.guardianEmail, role: "parent" },
    include: { parent: true },
  });

  let parent;
  let tempParentPassword: string | null = null;

  if (!existingParentUser) {
    tempParentPassword = randomBytes(6).toString("hex");
    const hashedParentPassword = await bcrypt.hash(tempParentPassword, 10);

    const parentUser = await tx.user.create({
      data: {
        name: data.guardianName,
        email: data.guardianEmail,
        phone: data.guardianPhone,
        sex: data.sex as any,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        bloodType: data.bloodType,
        password: hashedParentPassword,
        role: "parent",
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
    const existingParentRecord = existingParentUser.parent;
    if (!existingParentRecord) {
      throw new Error("Parent record not found for existing parent user.");
    }
    parent = await tx.parent.update({
      where: { id: existingParentRecord.id },
      data: { students: { connect: { id: student.id } } },
    });
  }

  await tx.user.update({
    where: { id: studentUser.id },
    data: { studentId: student.id },
  });

  if (!parent.userId) throw new Error("Parent userId is undefined.");
  await tx.user.update({
    where: { id: parent.userId },
    data: { parentId: parent.id },
  });

  return {
    student,
    parent,
    tempStudentPassword,
    tempParentPassword: !existingParentUser ? tempParentPassword : null,
    generatedAdmissionNo,
  };
}

export async function createStudentWithParentWithRetry(
  data: StudentCreationData,
): Promise<StudentCreationResult> {
  const MAX_ATTEMPTS = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          return await createStudentWithParent(tx as unknown as TxClient, data);
        },
        { timeout: 15000, maxWait: 10000 },
      );

      return result;
    } catch (error: any) {
      lastError = error;

      if (error?.code === "P2002" && attempt < MAX_ATTEMPTS) {
        console.warn(`admissionNo conflict on attempt ${attempt}, retrying...`);
        continue;
      }

      console.error("Transaction failed on attempt", attempt, error);
      break;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Unable to create student after multiple attempts");
}
