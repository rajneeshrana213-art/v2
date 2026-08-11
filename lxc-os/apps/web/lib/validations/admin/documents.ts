import { z } from "zod";

const DocumentTypeEnum = z.enum(["ID_CARD", "CERTIFICATE", "REPORT_CARD"]);
const DocumentCategoryEnum = z.enum([
  "STUDENT_ID",
  "TEACHER_ID",
  "STAFF_ID",
  "BONAFIDE",
  "NOC",
  "TRANSFER",
  "CHARACTER",
  "EXPERIENCE",
  "SALARY",
  "ADMISSION",
  "HOSTEL",
  "SPORTS",
  "SCHOLARSHIP",
  "ACHIEVEMENT",
  "FINAL_EXAM",
  "TERM_REPORT",
]);
const DocumentStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createDocumentTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  type: DocumentTypeEnum,
  category: DocumentCategoryEnum,
  content: z.string().min(1, "Template content is required"),
  isDefault: z.boolean().default(false),
  status: DocumentStatusEnum.default("PUBLISHED"),
  schoolId: z.string().nullable().optional(),
});

export const updateDocumentTemplateSchema = createDocumentTemplateSchema.partial();

export const issueDocumentSchema = z.object({
  templateId: z.string().cuid("Invalid template id"),
  targetUserId: z.string().cuid("Invalid target user id"),
  schoolId: z.string().optional(), // Required for superadmins
  data: z.any(), // Snapshot data for the document
});
