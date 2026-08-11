import { z } from "zod";

export const updateGuardianSchema = z.object({
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal("")),
  guardianPhone: z.string().optional(),
  guardianOccupation: z.string().optional(),
  guardianAddress: z.string().optional(),
});
