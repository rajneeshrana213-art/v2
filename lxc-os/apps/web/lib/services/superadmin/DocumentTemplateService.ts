import { prisma } from "@/lib/prisma";
import { DocumentType, DocumentCategory, DocumentStatus } from "@prisma/client";

export interface CreateTemplateInput {
  name: string;
  description?: string;
  type: DocumentType;
  category: DocumentCategory;
  content: any; // JSON content
  isDefault?: boolean;
  status?: DocumentStatus;
  schoolId?: string | null; // null for common templates, specific ID for school-specific
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  type?: DocumentType;
  category?: DocumentCategory;
  content?: any;
  isDefault?: boolean;
  status?: DocumentStatus;
  schoolId?: string | null;
}

export interface ShareTemplateInput {
  schoolIds: string[]; // Array of school IDs to share with
}

export class DocumentTemplateService {
  /**
   * Get all templates with optional filters
   */
  static async getTemplates(filters?: {
    schoolId?: string | null; // null = common templates, specific ID = school templates, undefined = all
    type?: DocumentType;
    category?: DocumentCategory;
    status?: DocumentStatus;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.schoolId !== undefined) {
      if (filters.schoolId === null) {
        // Common templates (no school assigned)
        where.schoolId = null;
      } else {
        // School-specific templates
        where.schoolId = filters.schoolId;
      }
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const templates = await prisma.documentTemplate.findMany({
      where,
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            schoolCode: true,
          },
        },
        _count: {
          select: {
            issuedDocuments: true,
          },
        },
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return templates;
  }

  /**
   * Get a single template by ID
   */
  static async getTemplateById(id: string) {
    const template = await prisma.documentTemplate.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            schoolCode: true,
          },
        },
        _count: {
          select: {
            issuedDocuments: true,
          },
        },
      },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    return template;
  }

  /**
   * Create a new template
   */
  static async createTemplate(data: CreateTemplateInput) {
    // If creating a default template, unset other defaults of the same type/category
    if (data.isDefault) {
      await prisma.documentTemplate.updateMany({
        where: {
          type: data.type,
          category: data.category,
          schoolId: data.schoolId || null,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.documentTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        category: data.category,
        content: data.content,
        isDefault: data.isDefault ?? false,
        status: data.status ?? DocumentStatus.PUBLISHED,
        schoolId: data.schoolId || null,
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            schoolCode: true,
          },
        },
      },
    });

    return template;
  }

  /**
   * Update a template
   */
  static async updateTemplate(id: string, data: UpdateTemplateInput) {
    // If setting as default, unset other defaults
    if (data.isDefault) {
      const existing = await prisma.documentTemplate.findUnique({
        where: { id },
        select: { type: true, category: true, schoolId: true },
      });

      if (existing) {
        await prisma.documentTemplate.updateMany({
          where: {
            type: existing.type,
            category: existing.category,
            schoolId: existing.schoolId || null,
            isDefault: true,
            id: { not: id },
          },
          data: {
            isDefault: false,
          },
        });
      }
    }

    const template = await prisma.documentTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type && { type: data.type }),
        ...(data.category && { category: data.category }),
        ...(data.content && { content: data.content }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.status && { status: data.status }),
        ...(data.schoolId !== undefined && { schoolId: data.schoolId || null }),
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            schoolCode: true,
          },
        },
      },
    });

    return template;
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string) {
    // Check if template has been used
    const usageCount = await prisma.issuedDocument.count({
      where: { templateId: id },
    });

    if (usageCount > 0) {
      throw new Error(
        `Cannot delete template. It has been used to issue ${usageCount} document(s).`
      );
    }

    await prisma.documentTemplate.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Share a template with multiple schools by creating copies
   */
  static async shareTemplateWithSchools(
    templateId: string,
    schoolIds: string[]
  ) {
    // Get the original template
    const originalTemplate = await this.getTemplateById(templateId);

    // Create copies for each school
    const createdTemplates = await Promise.all(
      schoolIds.map(async (schoolId) => {
        // Check if template already exists for this school
        const existing = await prisma.documentTemplate.findFirst({
          where: {
            schoolId,
            type: originalTemplate.type,
            category: originalTemplate.category,
            name: originalTemplate.name,
          },
        });

        if (existing) {
          // Update existing template
          return prisma.documentTemplate.update({
            where: { id: existing.id },
            data: {
              content: originalTemplate.content as any,
              description: originalTemplate.description,
              status: originalTemplate.status,
            },
            include: {
              school: {
                select: {
                  id: true,
                  schoolName: true,
                  schoolCode: true,
                },
              },
            },
          });
        } else {
          // Create new template for school
          return prisma.documentTemplate.create({
            data: {
              name: originalTemplate.name,
              description: originalTemplate.description,
              type: originalTemplate.type,
              category: originalTemplate.category,
              content: originalTemplate.content as any,
              isDefault: false,
              status: originalTemplate.status,
              schoolId,
            },
            include: {
              school: {
                select: {
                  id: true,
                  schoolName: true,
                  schoolCode: true,
                },
              },
            },
          });
        }
      })
    );

    return createdTemplates;
  }

  /**
   * Get all schools for sharing dropdown
   */
  static async getSchoolsForSharing() {
    const schools = await prisma.school.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        schoolName: true,
        schoolCode: true,
        user: {
          select: {
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        schoolName: "asc",
      },
    });

    return schools.map((s) => ({
      id: s.id,
      schoolName: s.schoolName,
      schoolCode: s.schoolCode,
      city: s.user.city,
      state: s.user.state,
    }));
  }

  /**
   * Clone a template to a specific school
   */
  static async cloneTemplate(templateId: string, schoolId: string) {
    const originalTemplate = await this.getTemplateById(templateId);

    const clonedTemplate = await prisma.documentTemplate.create({
      data: {
        name: `${originalTemplate.name} (Copy)`,
        description: originalTemplate.description,
        type: originalTemplate.type,
        category: originalTemplate.category,
        content: originalTemplate.content as any,
        isDefault: false,
        status: DocumentStatus.DRAFT,
        schoolId,
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            schoolCode: true,
          },
        },
      },
    });

    return clonedTemplate;
  }
}

