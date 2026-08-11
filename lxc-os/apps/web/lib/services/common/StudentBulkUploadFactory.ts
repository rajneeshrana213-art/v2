import { prisma } from "@/lib/prisma";
import { BulkUploadFactory, BulkUploadMetadata } from "./BulkUploadFactory";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { NotificationTrigger } from "@prisma/client";
import { triggerNotification } from "@/lib/services/notification/notification-service";
import { StudentCreationService } from "./StudentCreationService";

export interface StudentBulkRow {
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  classId?: string;
  className?: string;
  section?: string;
  admissionNo?: string;
  rollNo: string;
  [key: string]: any;
}

export class StudentBulkUploadFactory {
  /**
   * Phase 2: First Pass Validation Wall
   */
  static validateRows(rows: StudentBulkRow[], metadata: BulkUploadMetadata) {
    const validRows: StudentBulkRow[] = [];
    const failedRows: any[] = [];
    
    const fileEmails = new Set<string>();
    const filePhones = new Set<string>();
    const fileAdmissionNo = new Set<string>();

    rows.forEach((row, index) => {
      const rowNum = index + 2;
      const errors: string[] = [];

      // Email checks
      const email = row.email?.toLowerCase().trim();
      if (!email) errors.push("Email is required");
      else if (metadata.existingEmails.has(email)) errors.push(`Email ${email} already exists in system`);
      else if (fileEmails.has(email)) errors.push(`Duplicate email ${email} in file`);
      
      // Phone checks - Fully relaxed as requested (duplicates allowed in file)
      const phone = row.phone?.trim();

      // Admission No checks
      const adNo = row.admissionNo?.toString().toLowerCase().trim();
      if (adNo) {
        if (metadata.existingAdmissionNos.has(adNo)) errors.push(`Admission No ${adNo} already exists`);
        else if (fileAdmissionNo.has(adNo)) errors.push(`Duplicate Admission No ${adNo} in file`);
      }
      // Class/Section check
      const className = row.className?.toLowerCase().trim();
      if (!className && !row.classId) errors.push("Class name is required");
      const classInfo = className ? metadata.classes.get(className) : undefined;

      // Pre-assign admission number if missing to avoid race conditions in parallel processing
      if (!adNo && metadata.nextSequence !== undefined) {
        const initials = metadata.schoolName
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase())
          .join("");
        const seq = (metadata as any).runningSeq || metadata.nextSequence;
        const padded = String(seq).padStart(3, "0");
        const newAdNo = `${initials}-${padded}`.toLowerCase();
        
        row.admissionNo = newAdNo;
        (metadata as any).runningSeq = seq + 1;
        // Also add to fileAdmissionNo to prevent other rows from using it (though they are generated sequentially)
        fileAdmissionNo.add(newAdNo);
      }

      if (className && !classInfo) errors.push(`Class "${row.className}" not found`);
      
      if (classInfo && row.section) {
        const normalizedSection = row.section.toLowerCase().trim();
        const sectionId = classInfo.sections?.get(normalizedSection);
        if (!sectionId) errors.push(`Section "${row.section}" not found in class "${row.className}"`);
      }

      if (errors.length > 0) {
        failedRows.push({
          rowNumber: rowNum,
          name: row.name,
          errorMessage: errors.join(", ")
        });
      } else {
        if (email) fileEmails.add(email);
        if (phone) filePhones.add(phone);
        if (adNo) fileAdmissionNo.add(adNo);
        const resolvedRow = {
          ...row,
          rowNumber: rowNum,
          resolvedClassId: classInfo?.id || row.classId,
          resolvedClassName: classInfo?.name || row.className,
          resolvedSectionId: classInfo?.sections?.get(row.section?.toLowerCase().trim() || "") || null
        };
        // console.log(`[StudentBulkUploadFactory] Row ${rowNum} (${row.name}) validated. resolvedClassName: ${resolvedRow.resolvedClassName}`);
        validRows.push(resolvedRow);
      }
    });

    return { validRows, failedRows };
  }

  /**
   * Phase 5: Mass Production (Bulk Insert)
   * This handles a chunk of validated students.
   */
  static async processChunk(chunk: StudentBulkRow[], schoolId: string, metadata: BulkUploadMetadata, onProgress?: (success: boolean) => Promise<void>) {
    const results: any[] = [];
    const errors: any[] = [];

    // To avoid saturating the database connection pool, we process the chunk in smaller sub-batches
    // instead of all 50 students in parallel.
    const subChunks = BulkUploadFactory.chunkArray(chunk, 5);

    await BulkUploadFactory.processChunksParallel(subChunks, 1, async (subChunk) => {
      const creationPromises = subChunk.map(async (row) => {
        try {
          // console.log(`[StudentBulkUploadFactory] Processing record: ${row.name}, className: ${row.className}, resolvedClassName: ${(row as any).resolvedClassName}`);
          const result = await StudentCreationService.createStudentWithParentWithRetry({
            ...row,
            classId: row.resolvedClassId,
            section: row.resolvedSectionId,
            schoolId,
            skipEmail: true,
            skipLimitCheck: true, // We check limit once at the very beginning
            prefetchedData: {
              schoolName: metadata.schoolName,
              className: row.className
            }
          } as any);
          
          return { 
            success: true, 
            result: {
              ...result,
              className: (row as any).resolvedClassName || row.className
            } 
          };
        } catch (err: any) {
          return { success: false, error: err.message, row };
        }
      });

      const subResults = await Promise.all(creationPromises);
      
      for (const res of subResults) {
        if (res.success) results.push(res.result);
        else if (res.row) {
          errors.push({ 
            name: res.row.name, 
            studentEmail: res.row.email || res.row.studentEmail,
            rowNumber: res.row.rowNumber,
            errorMessage: res.error 
          });
        }
        if (onProgress) await onProgress(res.success);
      }
    });

    return { results, errors };
  }
}
