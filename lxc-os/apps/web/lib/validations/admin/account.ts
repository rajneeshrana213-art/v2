import { UserSex } from "@prisma/client";
import { z } from "zod";

export const registerAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  userName: z.string().min(1, "Username is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
  schoolId: z.string().cuid("Invalid school ID"),
  sex: z.nativeEnum(UserSex, { errorMap: () => ({ message: "Invalid gender" }) }),
  bloodType: z.string().min(1, "Blood type is required"),
});

export const updateAccountSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
});
