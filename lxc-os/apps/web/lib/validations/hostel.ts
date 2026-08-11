import { z } from "zod";
import { RoomType, RoomStatus, RequestStatus, ComplaintStatus, FeeStatus } from "@prisma/client";

// --- Hostel Validations ---

export const createHostelSchema = z.object({
  hostelName: z.string().min(1, "Hostel name is required"),
  location: z.string().min(1, "Location is required"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  schoolId: z.string().uuid("Invalid School ID"),
});

export const updateHostelSchema = z.object({
  hostelName: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
});

// --- Room Validations ---

export const createRoomSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  type: z.nativeEnum(RoomType),
  status: z.nativeEnum(RoomStatus).default("VACANT"),
  hostelId: z.string().uuid("Invalid Hostel ID"),
  capacity: z.number().int().positive().optional(), // Optional override for room capacity
});

export const updateRoomSchema = z.object({
  number: z.string().min(1).optional(),
  type: z.nativeEnum(RoomType).optional(),
  status: z.nativeEnum(RoomStatus).optional(),
  hostelId: z.string().uuid().optional(),
});

// --- Accommodation Request Validations ---

export const createAccommodationRequestSchema = z.object({
  studentId: z.string().uuid("Invalid Student ID"),
  hostelId: z.string().uuid("Invalid Hostel ID"),
});

export const updateAccommodationRequestSchema = z.object({
  status: z.nativeEnum(RequestStatus),
});

// --- Complaint Validations ---

export const createComplaintSchema = z.object({
  description: z.string().min(1, "Description is required"),
  studentId: z.string().uuid("Invalid Student ID"),
  hostelId: z.string().uuid("Invalid Hostel ID"),
});

export const updateComplaintSchema = z.object({
    description: z.string().optional(),
    status: z.nativeEnum(ComplaintStatus),
});

// --- Outpass Request Validations ---

export const createOutpassRequestSchema = z.object({
  studentId: z.string().uuid("Invalid Student ID"),
  reason: z.string().min(1, "Reason is required"),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
});

export const updateOutpassRequestSchema = z.object({
  studentId: z.string().uuid().optional(),
  reason: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  status: z.nativeEnum(RequestStatus).optional(),
});

// --- Hostel Expense Validations ---

export const createHostelExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive(),
  date: z.coerce.date(),
  hostelId: z.string().uuid("Invalid Hostel ID"),
});

export const updateHostelExpenseSchema = z.object({
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  date: z.coerce.date().optional(),
  hostelId: z.string().uuid().optional(),
});

// --- Hostel Fee Validations ---

export const createHostelFeeSchema = z.object({
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  studentId: z.string().uuid("Invalid Student ID"),
  hostelId: z.string().uuid("Invalid Hostel ID"),
  type: z.string().min(1, "Fee type is required"), // TODO: Check if enum exists
});

export const updateHostelFeeSchema = z.object({
  amount: z.number().positive().optional(),
  dueDate: z.coerce.date().optional(),
  status: z.nativeEnum(FeeStatus).optional(),
});

// --- Inventory Validations ---

export const createInventorySchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().int().nonnegative(),
  roomId: z.string().uuid("Invalid Room ID"),
});

export const updateInventorySchema = z.object({
  name: z.string().optional(),
  quantity: z.number().int().nonnegative().optional(),
});

// --- Medical Emergency Validations ---

export const createMedicalEmergencySchema = z.object({
  description: z.string().min(1, "Description is required"),
  date: z.coerce.date(),
  studentId: z.string().uuid("Invalid Student ID"),
  hostelId: z.string().uuid("Invalid Hostel ID"),
});

export const updateMedicalEmergencySchema = z.object({
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  studentId: z.string().uuid().optional(),
  hostelId: z.string().uuid().optional(),
});

