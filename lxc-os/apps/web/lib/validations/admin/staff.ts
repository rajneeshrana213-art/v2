import { UserSex } from "@prisma/client";
import { z } from "zod";

const commonStaffSchema = {
  role: z.string().min(1, "Role is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  userName: z.string().min(1).optional().nullable(), // Made optional for backend generation
  phone: z.string().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
  schoolId: z.string().cuid("Invalid school id").optional(),
  sex: z.nativeEnum(UserSex),
  bloodType: z.string().min(1, "Blood type is required"),
  profilePic: z.string().optional().nullable(),
};

export const registerAccountSchema = z.object(commonStaffSchema);

export const registerDriverSchema = z.object({
  ...commonStaffSchema,
  license: z.string().min(1, "License number is required"),
  busId: z.string().optional().nullable(),
  licensePhoto: z.string().optional().nullable(),
});

export const registerHostelSchema = z.object({
  ...commonStaffSchema,
  hostelName: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
});

export const registerAcademicsSchema = z.object(commonStaffSchema);

export const registerStaffSchema = z.object(commonStaffSchema);

export const updateStaffSchema = z.object({
  name: z.string().optional(),
  userName: z.string().optional().nullable(),
  email: z.string().email().optional(),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  sex: z.nativeEnum(UserSex).optional(),
  bloodType: z.string().optional(),
  profilePic: z.string().optional().nullable(),
  // Role-specific optional fields
  hostelName: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  license: z.string().optional().nullable(),
  busId: z.string().optional().nullable(),
  licensePhoto: z.string().optional().nullable(),
});

export const bulkStaffUploadSchema = z.array(z.object({
  role: z.enum(["account", "transport", "hostel", "library", "driver", "academics", "staff"]),
  name: z.string().min(1),
  email: z.string().email(),
  userName: z.string().min(1).optional(),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  pincode: z.string().min(1),
  schoolId: z.string().cuid(),
  sex: z.nativeEnum(UserSex),
  bloodType: z.string().min(1),
  profilePic: z.string().optional(),
  // Optional/Conditional fields
  hostelName: z.string().optional(),
  capacity: z.string().optional(),
  license: z.string().optional(),
  busId: z.string().optional(),
}));
