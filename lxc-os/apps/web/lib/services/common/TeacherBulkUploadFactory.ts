import { BulkUploadFactory, BulkUploadMetadata } from "./BulkUploadFactory";
import { TeacherCreationService } from "./TeacherCreationService";
import { registerTeacherSchema } from "@/lib/validations/admin/teacher";
import { z } from "zod";

export interface TeacherBulkRow {
  name: string;
  email: string;
  phone: string;
  address: string;
  sex: string;
  qualification: string;
  [key: string]: any;
}

const excelDateToJS = (serial: any) => {
  if (typeof serial === "number") {
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString();
  }
  return serial;
};

const normalizeKeys = (obj: any) => {
  const normalized: any = {};
  const mapping: Record<string, string> = {
    "Full Name": "name",
    "Teacher Name": "name",
    Username: "userName",
    "Email Address": "email",
    "Phone Number": "phone",
    Gender: "sex",
    "Blood Group": "bloodType",
    "Date of Birth": "dateOfBirth",
    "Date of Joining": "dateofJoin",
    "Father Name": "fatherName",
    "Mother Name": "motherName",
    "Marital Status": "maritalStatus",
    Languages: "languagesKnown",
    "Work Experience": "workExperience",
    "Street Address": "address",
    "Postal Code": "pincode",
  };

  Object.keys(obj).forEach((key) => {
    let normalizedKey = key.trim();
    if (mapping[normalizedKey]) {
      normalizedKey = mapping[normalizedKey];
    } else {
      normalizedKey = normalizedKey.charAt(0).toLowerCase() + normalizedKey.slice(1);
      normalizedKey = normalizedKey.replace(/\s+/g, "");
    }

    let value = obj[key];
    if (["dateOfBirth", "dateofJoin", "dateOfPayment"].includes(normalizedKey)) {
      value = excelDateToJS(value);
    }

    const stringFields = ["phone", "workExperience", "pincode", "accountNumber", "previousSchoolPhone"];
    if (stringFields.includes(normalizedKey) && typeof value === "number") {
      value = String(value);
    }

    if (["sex", "maritalStatus", "status"].includes(normalizedKey)) {
      if (typeof value === "string") value = value.toUpperCase().trim();
    }

    normalized[normalizedKey] = value;
  });
  return normalized;
};

export class TeacherBulkUploadFactory {
  static validateRows(rows: any[], metadata: BulkUploadMetadata) {
    const validRows: TeacherBulkRow[] = [];
    const failedRows: any[] = [];
    
    const fileEmails = new Set<string>();
    const filePhones = new Set<string>();

    rows.forEach((rawRow, index) => {
      const rowNum = index + 2;
      const row = normalizeKeys(rawRow);
      const errors: string[] = [];

      // Zod Validation First
      const validationResult = registerTeacherSchema.safeParse(row);
      if (!validationResult.success) {
        errors.push(validationResult.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
      } else {
        const validated = validationResult.data;
        const email = validated.email?.toLowerCase().trim();
        if (!email) errors.push("Email is required");
        else if (metadata.existingEmails.has(email)) errors.push(`Email ${email} already exists`);
        else if (fileEmails.has(email)) errors.push(`Duplicate email ${email} in file`);
        
        // Phone checks - Fully relaxed as requested (duplicates allowed in file)
        const phone = validated.phone?.trim();

        if (errors.length === 0) {
          fileEmails.add(email);
          if (phone) filePhones.add(phone);
          validRows.push(validated as any);
        }
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

  static async processChunk(chunk: TeacherBulkRow[], schoolId: string, metadata: BulkUploadMetadata, onProgress?: (success: boolean) => Promise<void>) {
    const results: any[] = [];
    const errors: any[] = [];

    // Use smaller sub-batches to avoid saturating the database connection pool
    const subChunks = BulkUploadFactory.chunkArray(chunk, 5);

    await BulkUploadFactory.processChunksParallel(subChunks, 1, async (subChunk) => {
      const creationPromises = subChunk.map(async (row) => {
        try {
          const result = await TeacherCreationService.createTeacherWithRetry({
            ...row,
            schoolId,
            skipEmail: true,
            skipLimitCheck: true,
            prefetchedData: {
              schoolName: metadata.schoolName
            },
            // Sane defaults for missing template fields
            userName: row.userName || row.email?.split('@')[0],
            bloodType: row.bloodType || "Not Specified",
            city: row.city || "Not Provided",
            state: row.state || "Not Provided",
            country: row.country || "India",
            pincode: row.pincode || "000000",
            dateofJoin: row.dateofJoin || new Date(),
            fatherName: row.fatherName || "Not Provided",
            motherName: row.motherName || "Not Provided",
            dateOfBirth: row.dateOfBirth || new Date(),
            maritalStatus: (row.maritalStatus as any) || "SINGLE",
            languagesKnown: row.languagesKnown || "Not Specified",
            qualification: row.qualification || "Not Specified",
            workExperience: row.workExperience || "0",
            previousSchool: row.previousSchool || "N/A",
            previousSchoolAddress: row.previousSchoolAddress || "N/A",
            previousSchoolPhone: row.previousSchoolPhone || "N/A",
            salary: Number(row.salary) || 0,
            accountNumber: row.accountNumber || "N/A",
            bankName: row.bankName || "N/A",
            ifscCode: row.ifscCode || "N/A",
            branchName: row.branchName || "N/A"
          } as any);
          return { 
            success: true, 
            result: {
              ...result,
              teacherName: row.name,
              teacherEmail: row.email,
              teacherUserName: result.user.userName
            } 
          };
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
