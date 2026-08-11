
import { z } from "zod";
import { UserSex } from "@prisma/client";

// --- SCHOOL ---
export const registerSchoolSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(15).regex(/^[+]?[\d\s-()]+$/),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  pincode: z.string().min(5).max(10).regex(/^[\d-]+$/),
  bloodType: z.string().min(1),
  sex: z.nativeEnum(UserSex),
  schoolName: z.string().min(1).max(200),
  userName: z.string().optional(),
  password: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  planId: z.string().cuid().optional(),
});

export const updateSchoolSchema = z.object({
  schoolName: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  pincode: z.string().min(1).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export const schoolIdParamSchema = z.object({
  id: z.string().cuid("Invalid school ID"),
});

// --- PLAN ---
export const planSchema = z.object({
  name: z.string().min(5),
  price: z.number().min(1),
  userLimit: z.number().int().min(3),
  durationDays: z.number().int().min(1),
  discountedPrice: z.number().min(0).optional(),
});

export const planIdParamSchema = z.object({
  id: z.string().cuid("Invalid plan ID"),
});

// --- USER ---
export const userIdParamSchema = z.object({
  id: z.string().cuid("Invalid user ID"),
});
