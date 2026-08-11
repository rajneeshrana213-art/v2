import { z } from "zod";

export const registerStudentSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  userName: z.string().min(3).max(20).optional(),
  name: z.string().min(2).max(100),
  sex: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string().or(z.date()), // Accepts string for easier API handling
  bloodType: z.string().optional(),
  Religion: z.string().optional(),
  category: z.string().optional(),
  caste: z.string().optional(),
  motherTongue: z.string().optional(),
  languagesKnown: z.string().optional(),

  // Father
  fatherName: z.string().min(2).max(100),
  fatheremail: z.string().email().optional().or(z.literal("")),
  fatherPhone: z.string().min(10).max(15),
  fatherOccupation: z.string().optional(),

  // Mother
  motherName: z.string().min(2).max(100),
  motherOccupation: z.string().optional(),
  motherEmail: z.string().email().optional().or(z.literal("")),
  motherPhone: z.string().min(10).max(15),

  // Guardian
  guardianName: z.string().min(2).max(100),
  guardianRelation: z.string().min(2).max(50),
  guardianEmail: z.string().email(),
  guardianPhone: z.string().min(10).max(15),
  guardianOccupation: z.string().optional(),
  guardianAddress: z.string().optional(),

  // Siblings
  areSiblingStudying: z.boolean().optional(),
  siblingName: z.string().optional(),
  siblingClass: z.string().optional(),
  siblingRollNo: z.string().optional(),
  siblingAdmissionNo: z.string().optional(),

  // Addresses
  currentAddress: z.string().min(5).max(500),
  permanentAddress: z.string().min(5).max(500),
  address: z.string().min(5).max(500).optional(), // General address fallback
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  pincode: z.string().min(3).max(10),

  vehicleNumber: z.string().optional(),
  hostelName: z.string().optional(),
  roomNumber: z.string().optional(),

  medicalCondition: z.string().optional(),
  allergies: z.string().optional(),
  medicationName: z.string().optional(),

  schoolName: z.string().optional(),
  schoolId: z.string().uuid(),
  classId: z.string().uuid(),

  academicYear: z.string().optional(),
  admissionDate: z.string().or(z.date()).optional(),
  rollNumber: z.string().optional(),
  status: z.string().optional(),
});

export const updateStudentSchema = registerStudentSchema.partial();
