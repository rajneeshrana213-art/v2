
import { z } from "zod";
import { TaskPriority, IssueType } from "@prisma/client";

// --- PROJECT ---
export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  key: z.string().max(10).regex(/^[A-Z0-9]*$/).optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  createdBy: z.string().cuid(),
  leadId: z.string().cuid().optional(),
  type: z.enum(["Software", "Business", "Service"]).optional(),
  workflow: z.array(z.object({
      name: z.string().min(1),
      order: z.number().int(),
  })).optional(),
});
export const updateProjectSchema = projectSchema.partial().extend({
    isArchived: z.boolean().optional(),
});

export const workflowSchema = z.array(z.object({
    name: z.string().min(1),
    order: z.number().int(),
}));

// --- TASK ---
export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().cuid(),
  assignedToId: z.string().cuid().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  stageId: z.string().cuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  issueType: z.nativeEnum(IssueType).optional(),
  severity: z.number().int().min(1).max(5).optional(),
  storyPoints: z.number().int().min(1).optional(),
  createdById: z.string().cuid(),
  sprintId: z.string().cuid().optional(),
  parentId: z.string().cuid().optional(),
  epicId: z.string().cuid().optional(),
  labelIds: z.array(z.string().cuid()).optional(),
  checklist: z.array(z.object({ text: z.string(), done: z.boolean() })).optional(),
});
export const updateTaskSchema = taskSchema.partial();
export const taskStatusSchema = z.object({
    id: z.string().cuid(),
    stageId: z.string().cuid(),
});

// --- COMMENT ---
export const commentSchema = z.object({
    id: z.string().cuid(), // Task ID
    authorId: z.string().cuid(),
    content: z.string().min(1),
});
export const updateCommentSchema = z.object({ content: z.string().min(1) });

// --- SPRINT ---
export const sprintSchema = z.object({
    name: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    projectId: z.string().cuid(),
});
export const updateSprintSchema = sprintSchema.partial();
export const assignSprintSchema = z.object({ sprintId: z.string().cuid().nullable() });

// --- EPIC ---
export const epicSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().cuid(),
    createdById: z.string().cuid(),
});
export const updateEpicSchema = epicSchema.partial();

// --- LABEL ---
export const labelSchema = z.object({
    name: z.string().min(1),
    color: z.string().min(1),
    projectId: z.string().cuid(),
});
export const updateLabelSchema = labelSchema.partial();

// --- GITHUB ---
export const githubRepoSchema = z.object({
    repoName: z.string().min(1),
    token: z.string().min(1),
});
export const githubBranchSchema = z.object({
    name: z.string().min(1),
    base: z.string().optional(),
    prUrl: z.string().url().optional(),
    url: z.string().url().optional(),
    status: z.string().optional(),
});
