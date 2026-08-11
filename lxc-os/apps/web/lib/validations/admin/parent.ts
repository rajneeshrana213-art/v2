import { z } from "zod";

export const schoolIdParamSchema = z.object({
  schoolId: z.string().uuid().or(z.string()),
});

export const parentIdParamSchema = z.object({
  id: z.string().uuid().or(z.string()),
});

export const parentIdOnlySchema = z.object({
  parentId: z.string().uuid().or(z.string()),
});
