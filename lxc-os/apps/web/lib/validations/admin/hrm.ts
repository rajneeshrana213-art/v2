import { PayrollStatus, UserSex, EmployeeType } from "@prisma/client";
import { z } from "zod";

// Department
export const createDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  schoolId: z.string().cuid("Invalid school id"),
});

export const updateDepartmentSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

// Designation
export const createDesignationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  schoolId: z.string().cuid("Invalid school id"),
});

export const updateDesignationSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

// Duty
export const createDutySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  hostelId: z.string().cuid(),
  assignedTo: z.string().cuid().optional(),
  schoolId: z.string().cuid("Invalid school id"),
});

export const updateDutySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

// Payroll
export const createPayrollSchema = z.object({
  userId: z.string().cuid("Invalid user id"),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  grossSalary: z.number(),
  deductions: z.number().optional(),
  schoolId: z.string().cuid("Invalid school id"),
});

export const updatePayrollSchema = z.object({
  grossSalary: z.number(),
  deductions: z.number().optional(),
  paymentDate: z.coerce.date().optional(),
  status: z.nativeEnum(PayrollStatus),
});

// Employee
export const registerEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  pincode: z.string().min(1).optional(),
  bloodType: z.string().optional(),
  sex: z.nativeEnum(UserSex).optional(),
  employeeType: z.nativeEnum(EmployeeType).optional(),
  company: z.string().optional(),
  userId: z.string().optional(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  schoolId: z.string().cuid("Invalid school id").optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  bloodType: z.string().optional(),
  sex: z.nativeEnum(UserSex),
  employeeType: z.nativeEnum(EmployeeType).optional(),
  company: z.string().optional(),
});

// Staff (Generic)
export const registerStaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  pincode: z.string().min(1),
  bloodType: z.string(),
  userName : z.string().min(1).optional(),
  sex: z.nativeEnum(UserSex),
  schoolId: z.string().cuid("Invalid school id").optional(),
});

// Attendance
export const punchSchema = z.object({
  employeeId: z.string().cuid().optional(),
  employeeCode: z.string().min(1).optional(),
}).refine(data => data.employeeId || data.employeeCode, {
  message: "Either employeeId or employeeCode is required"
});

// Employee Documents
export const uploadDocumentSchema = z.object({
  employeeId: z.string().cuid(),
  folder: z.string().min(1),
});

// Inventory
export const createInventorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().int().min(0),
  schoolId: z.string().cuid(),
});

export const updateInventorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
});

export const inventoryTransactionSchema = z.object({
  inventoryItemId: z.string().cuid(),
  type: z.enum(["ADD", "REMOVE"]),
  quantity: z.number().int().positive(),
  userId: z.string().cuid(),
});
