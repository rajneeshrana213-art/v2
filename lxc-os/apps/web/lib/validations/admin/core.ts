import { z } from "zod";

// Guardian Validations
export const updateGuardianSchema = z.object({
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianRelation: z.string().min(1, "Relation is required"),
  guardianEmail: z.string().email("Invalid email address"),
  guardianPhone: z.string().min(1, "Phone number is required"),
  guardianOccupation: z.string().min(1, "Occupation is required"),
  guardianAddress: z.string().min(1, "Address is required"),
});

// Parent Validations
export const schoolIdParamSchema = z.object({
  schoolId: z.string().cuid("Invalid school id"),
});

export const parentIdParamSchema = z.object({
  id: z.string().cuid("Invalid parent id"),
});

export const parentIdOnlySchema = z.object({
  parentId: z.string().cuid("Invalid parent id"),
});
