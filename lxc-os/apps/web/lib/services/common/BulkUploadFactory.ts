import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

export interface BulkUploadMetadata {
  schoolName: string;
  classes: Map<string, { id: string; name: string; sections: Map<string, string> }>;
  existingEmails: Set<string>;
  existingUserNames: Set<string>;
  existingAdmissionNos: Set<string>;
  activeAcademicYearId?: string;
  nextSequence?: number;
}

export class BulkUploadFactory {
  /**
   * Phase 1: Prefetch Layer
   * Fetches all necessary context data once to avoid DB hits in loops.
   */
  static async prefetchMetadata(schoolId: string): Promise<BulkUploadMetadata> {
    const [school, classes, users, students, academicYear] = await Promise.all([
      prisma.school.findUnique({
        where: { id: schoolId },
        select: { schoolName: true }
      }),
      prisma.class.findMany({
        where: { schoolId },
        include: { Section: true }
      }),
      prisma.user.findMany({
        where: { schoolId },
        select: { email: true, userName: true }
      }),
      prisma.student.findMany({
        where: { schoolId },
        select: { admissionNo: true }
      }),
      prisma.academicYear.findFirst({
        where: { schoolId, isActive: true }
      })
    ]);

    const classMap = new Map();
    classes.forEach((c) => {
      const sectionMap = new Map();
      c.Section.forEach((s) => sectionMap.set(s.name.toLowerCase().trim(), s.id));
      classMap.set(c.name.toLowerCase().trim(), {
        id: c.id,
        name: c.name,
        sections: sectionMap
      });
      // Also map by ID for convenience
      classMap.set(c.id, {
        id: c.id,
        name: c.name,
        sections: sectionMap
      });
    });

    return {
      schoolName: school?.schoolName || "N/A",
      classes: classMap,
      existingEmails: new Set(users.map(u => u.email?.toLowerCase().trim()).filter(Boolean) as string[]),
      existingUserNames: new Set(users.map(u => u.userName?.toLowerCase().trim()).filter(Boolean) as string[]),
      existingAdmissionNos: new Set(students.map(s => s.admissionNo.toLowerCase().trim())),
      activeAcademicYearId: academicYear?.id,
      nextSequence: (() => {
        // Find highest numeric suffix in existing admission numbers for this school
        const sequenceNumbers = students
          .map(s => {
            const match = s.admissionNo.match(/-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(n => n > 0);
        
        return sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) + 1 : students.length + 1;
      })()
    };
  }

  /**
   * Phase 3: Chunking Logic
   */
  static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Phase 4: Assembly Line (Controlled Parallelism)
   */
  static async processChunksParallel<T, R>(
    chunks: T[][],
    concurrency: number,
    processor: (chunk: T[], chunkIndex: number) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < chunks.length; i += concurrency) {
      const batch = chunks.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((chunk, index) => processor(chunk, i + index))
      );
      results.push(...batchResults);
    }
    return results;
  }
}
