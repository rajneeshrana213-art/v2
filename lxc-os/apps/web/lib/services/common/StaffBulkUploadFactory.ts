import { BulkUploadFactory, BulkUploadMetadata } from "./BulkUploadFactory";
import { StaffService } from "../admin/core/StaffService";
import { bulkStaffUploadSchema } from "@/lib/validations/admin/staff";
import { z } from "zod";

export interface StaffBulkRow {
  name: string;
  email: string;
  phone: string;
  role: string;
  [key: string]: any;
}

const normalizeKeys = (obj: any) => {
  const normalized: any = {};
  // Standard staff fields normalization
  Object.keys(obj).forEach((key) => {
    let normalizedKey = key.trim().toLowerCase();
    // Simple mapping if needed, otherwise camelCase it
    if (normalizedKey === 'full name') normalizedKey = 'name';
    if (normalizedKey === 'email address') normalizedKey = 'email';
    if (normalizedKey === 'phone number') normalizedKey = 'phone';
    
    // Convert to camelCase
    normalizedKey = normalizedKey.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');

    normalized[normalizedKey] = obj[key];
  });
  return normalized;
};

export class StaffBulkUploadFactory {
  static validateRows(rows: any[], metadata: BulkUploadMetadata) {
    const validRows: StaffBulkRow[] = [];
    const failedRows: any[] = [];
    
    const fileEmails = new Set<string>();
    const filePhones = new Set<string>();

    rows.forEach((rawRow, index) => {
      const rowNum = index + 2;
      const row = normalizeKeys(rawRow);
      const errors: string[] = [];

      // Safe parse each row if needed, but the schema is usually applied to the whole array
      // For Phase 2, we validate individually
      try {
        const email = row.email?.toLowerCase().trim();
        if (!email) errors.push("Email is required");
        else if (metadata.existingEmails.has(email)) errors.push(`Email ${email} already exists`);
        else if (fileEmails.has(email)) errors.push(`Duplicate email ${email} in file`);
        
        // Phone checks - Fully relaxed as requested (duplicates allowed in file)
        const phone = row.phone?.trim();

        const role = row.role?.toLowerCase()?.trim();
        if (!role) errors.push("Role is required");

        if (errors.length === 0) {
          fileEmails.add(email);
          if (phone) filePhones.add(phone);
          validRows.push(row as any);
        }
      } catch (err: any) {
        errors.push(err.message);
      }

      if (errors.length > 0) {
        failedRows.push({
          rowNumber: rowNum,
          name: row.name || "N/A",
          errorMessage: errors.join(", ")
        });
      }
    });

    return { validRows, failedRows };
  }


  static async processChunk(chunk: StaffBulkRow[], schoolId: string, metadata: BulkUploadMetadata, onProgress?: (success: boolean) => Promise<void>) {
    const results: any[] = [];
    const errors: any[] = [];

    // Use smaller sub-batches to avoid saturating the database connection pool
    const subChunks = BulkUploadFactory.chunkArray(chunk, 5);

    await BulkUploadFactory.processChunksParallel(subChunks, 1, async (subChunk) => {
      const creationPromises = subChunk.map(async (row) => {
        try {
          let result;
          const staffData = {
            ...row,
            schoolId,
            skipEmail: true,
            skipLimitCheck: true,
            schoolName: metadata.schoolName
          };

          const role = row.role?.toLowerCase() || "";
          
          if (role === 'accountant' || role === 'account') {
            result = await StaffService.createAccountant(staffData, null);
          } else if (role === 'librarian' || role === 'library') {
            result = await StaffService.createLibrarian(staffData, null);
          } else if (role === 'receptionist') {
            // Receptionist might not have a dedicated method in StaffService, check generic
            result = await StaffService.createGenericStaff(staffData, null);
          } else if (role === 'hostel_warden' || role === 'hostel') {
            result = await StaffService.createHostel(staffData, null);
          } else if (role === 'conductor') {
            // Conductor also seems missing or generic
            result = await StaffService.createGenericStaff(staffData, null);
          } else if (role === 'academics') {
            result = await StaffService.createAcademicsStaff(staffData, null);
          } else if (role === 'transport') {
            result = await StaffService.createTransport(staffData, null);
          } else if (role === 'driver') {
            result = await StaffService.createDriver(staffData, null);
          } else {
            result = await StaffService.createGenericStaff(staffData, null);
          }

          return { success: true, result };
        } catch (err: any) {
          return { success: false, error: err.message, row };
        }
      });

      const subResults = await Promise.all(creationPromises);
      
      for (const res of subResults) {
        if (res.success) results.push(res.result);
        else if (res.row) errors.push({ name: res.row.name, errorMessage: res.error });
        if (onProgress) await onProgress(res.success);
      }
    });

    return { results, errors };
  }
}
