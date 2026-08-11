import { z } from "zod";
import { MaritalStatus, UserSex, ActiveStatus } from "@prisma/client";

export const registerTeacherSchema = z.object({
  // User Info
  name: z.string().min(1),
  userName: z.string().nullish().or(z.literal("")),
  sex: z.nativeEnum(UserSex),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  bloodType: z.coerce.string().min(1),
  img: z.string().nullish(),

  // Core Teacher Fields
  teacherSchoolId: z.string().min(1).optional(),
  dateofJoin: z.coerce
    .date()
    .refine((date) => date <= new Date(), {
      message: "Joining date cannot be in the future",
    }),
  fatherName: z.string().min(1),
  motherName: z.string().min(1),
  dateOfBirth: z.coerce
    .date()
    .refine((date) => date <= new Date(), {
      message: "Date of birth cannot be in the future",
    }),
  maritalStatus: z.nativeEnum(MaritalStatus),
  languagesKnown: z.coerce.string().min(1),
  qualification: z.coerce.string().min(1),
  workExperience: z.coerce.string().min(1),
  previousSchool: z.string().min(1).optional(),
  previousSchoolAddress: z.string().min(1).optional(),
  previousSchoolPhone: z.string().min(1).optional(),
  panNumber: z.string().optional().or(z.literal("")),

  // Employment & Status
  status: z.nativeEnum(ActiveStatus).optional(),
  salary: z
    .preprocess(
      (val) =>
        val === "" || val === undefined || val === null ? 0 : Number(val),
      z.number(),
    )
    .optional(),

  contractType: z.string().min(1).optional(),
  dateOfPayment: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null ? undefined : val,
    z.coerce.date().optional(),
  ),

  // Leaves (Optional)
  medicalLeave: z.union([z.string(), z.null(), z.undefined()]).optional(),
  casualLeave: z.union([z.string(), z.null(), z.undefined()]).optional(),
  maternityLeave: z.union([z.string(), z.null(), z.undefined()]).optional(),
  sickLeave: z.union([z.string(), z.null(), z.undefined()]).optional(),

  // Bank Info
  accountNumber: z.string().optional().nullable().or(z.literal("")),
  bankName: z.string().optional().nullable().or(z.literal("")),
  ifscCode: z.string().optional().nullable().or(z.literal("")),
  branchName: z.string().optional().nullable().or(z.literal("")),

  // Hostel / Route (Optional)
  route: z.union([z.string(), z.null(), z.undefined()]).optional(),
  hostelName: z.union([z.string(), z.null(), z.undefined()]).optional(),
  roomNumber: z.union([z.string(), z.null(), z.undefined()]).optional(),

  // Social Links (Optional)
  facebook: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url().nullish(),
  ),
  twitter: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url().nullish(),
  ),
  linkedin: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url().nullish(),
  ),
  instagram: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url().nullish(),
  ),
  youtube: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url().nullish(),
  ),

  // School Reference
  schoolId: z.string().min(1, "School ID is required"),

  // Address Info
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  pincode: z.coerce.string().min(1),
});

export const updateTeacherSchema = registerTeacherSchema.partial();
