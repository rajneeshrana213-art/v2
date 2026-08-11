import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { z } from "zod";
import { registerTeacherSchema } from "@/lib/validations/admin/teacher";
import { TeacherCreationService } from "@/lib/services/common/TeacherCreationService";
import { BulkUploadJobService } from "@/lib/services/bulk-upload-job-service";
import * as XLSX from "xlsx";
import { renderAndSendEmail } from "@/lib/utils/mailer";

import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";
import { BulkUploadFactory } from "@/lib/services/common/BulkUploadFactory";
import { TeacherBulkUploadFactory } from "@/lib/services/common/TeacherBulkUploadFactory";
import { getISTDateString } from "@/lib/utils/date-utils";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const bulkTeacherUploadSchema = z.array(registerTeacherSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  const user = (req as any).user;
  if (!user.schoolId) {
    return res
      .status(400)
      .json({ error: "User is not associated with a school" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Inject schoolId from authenticated user into each record
    const rawData = Array.isArray(req.body) ? req.body : [];
    const enrichedData = rawData.map((item: any) => ({
      ...item,
      schoolId: user.schoolId,
    }));
    const totalItems = enrichedData.length;

    // Pre-check teacher limit
    try {
      await SubscriptionService.validateBulkLimit(user.schoolId, totalItems);
    } catch (limitError: any) {
      console.warn(`[Bulk Upload] Limit exceeded: ${limitError.message}`);
      return res.status(403).json({
        error: limitError.message,
        details: limitError.details || {},
        limitExceeded: true,
      });
    }

    // Helper to normalize Excel dates
    const excelDateToJS = (serial: any) => {
      if (typeof serial === "number") {
        const date = new Date((serial - 25569) * 86400 * 1000);
        return date.toISOString();
      }
      return serial;
    };

    // Helper to normalize keys (Lowercase first letter, handle spaces/case)
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
          normalizedKey =
            normalizedKey.charAt(0).toLowerCase() + normalizedKey.slice(1);
          normalizedKey = normalizedKey.replace(/\s+/g, "");
        }

        // Normalize specific values
        let value = obj[key];
        if (
          normalizedKey === "dateOfBirth" ||
          normalizedKey === "dateofJoin" ||
          normalizedKey === "dateOfPayment"
        ) {
          value = excelDateToJS(value);
        }

        // Handle numeric fields that should be strings
        const stringFields = [
          "phone",
          "workExperience",
          "pincode",
          "accountNumber",
          "previousSchoolPhone",
        ];
        if (stringFields.includes(normalizedKey) && typeof value === "number") {
          value = String(value);
        }

        // Normalize Enum values
        if (
          normalizedKey === "sex" ||
          normalizedKey === "maritalStatus" ||
          normalizedKey === "status"
        ) {
          if (typeof value === "string") {
            value = value.toUpperCase().trim();
          }
        }

        normalized[normalizedKey] = value;
      });
      return normalized;
    };

    // Phase 1 & 2: Pre-fetch and Validation Wall
    const metadata = await BulkUploadFactory.prefetchMetadata(user.schoolId);
    const { validRows, failedRows: validationErrors } = TeacherBulkUploadFactory.validateRows(enrichedData, metadata);

    if (validRows.length === 0 && validationErrors.length > 0) {
      return res.status(400).json({
        error: "All records failed validation.",
        details: validationErrors,
        failedCount: validationErrors.length
      });
    }

    // Create job and return job ID immediately
    const jobId = await BulkUploadJobService.createJob(
      "teachers",
      totalItems,
      user.schoolId,
    );

    // Process asynchronously (Phase 3-9)
    (async () => {
      try {
        const finalResults: any[] = [];
        const finalErrors: any[] = [...validationErrors];

        // Phase 3: Chunking (Reduced size for better real-time updates)
        const chunks = BulkUploadFactory.chunkArray(validRows, 10);

        let processedCount = validationErrors.length;
        let successCount = 0;
        let errorCount = validationErrors.length;

        await BulkUploadFactory.processChunksParallel(chunks, 5, async (chunk) => {
          const { results, errors } = await TeacherBulkUploadFactory.processChunk(
            chunk as any, 
            user.schoolId, 
            metadata,
            async (success) => {
              processedCount++;
              if (success) successCount++;
              else errorCount++;

              // Update progress one-by-one (Phase 8)
              await BulkUploadJobService.updateProgress(
                jobId,
                processedCount,
                successCount,
                errorCount,
              );
            }
          );
          finalResults.push(...results);
          finalErrors.push(...errors);
        });

        const results = finalResults;
        const errors = finalErrors;


        // Generate Excel files
        let successFileBase64 = null;
        let errorFileBase64 = null;

        if (results.length > 0) {
          const successData = results.map((result, idx) => ({
            "S.No": idx + 1,
            "School Name": result.schoolName || "N/A",
            "Teacher Name": result.teacherName || "N/A",
            "Teacher Email": result.teacherEmail || "N/A",
            Username: result.teacherUserName || "N/A",
            Password: result.tempPassword || "N/A",
            "Teacher School ID": result.teacher?.teacherSchoolId || "N/A",
          }));

          const successWs = XLSX.utils.json_to_sheet(successData);
          const successWb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(
            successWb,
            successWs,
            "Teacher Credentials",
          );
          const successBuffer = XLSX.write(successWb, {
            type: "buffer",
            bookType: "xlsx",
          });
          successFileBase64 = successBuffer.toString("base64");
        }

        if (errors.length > 0) {
          const errorData = errors.map((error) => ({
            "Row Number": error.rowNumber,
            "Teacher Name": error.teacherName,
            "Teacher Email": error.teacherEmail,
            Username: error.teacherUserName,
            "Error Message": error.errorMessage,
            "Error Details": error.errorDetails || "N/A",
          }));

          const errorWs = XLSX.utils.json_to_sheet(errorData);
          const errorWb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(errorWb, errorWs, "Errors");
          const errorBuffer = XLSX.write(errorWb, {
            type: "buffer",
            bookType: "xlsx",
          });
          errorFileBase64 = errorBuffer.toString("base64");
        }

        // Send consolidated email to admin and credentialslxc@gmail.com
        try {
          const istDateKey = getISTDateString();
          const emailAttachments: any[] = [];
          if (successFileBase64) {
            emailAttachments.push({
              filename: `teacher_credentials_${istDateKey}.xlsx`,
              content: Buffer.from(successFileBase64, "base64"),
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
          }
          if (errorFileBase64) {
            emailAttachments.push({
              filename: `teacher_upload_errors_${istDateKey}.xlsx`,
              content: Buffer.from(errorFileBase64, "base64"),
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
          }

          if (emailAttachments.length > 0) {
            const adminEmail = user.email;
            const emailTo = `${adminEmail}, credentialslxc@gmail.com`;

            await renderAndSendEmail(
              "bulk-upload-results",
              {
                uploadType: "Teachers",
                totalItems: totalItems,
                successCount: results.length,
                failedCount: errors.length,
              },
              "Bulk Upload Results - Teachers",
              emailTo,
              { attachments: emailAttachments },
            );
          }
        } catch (emailErr) {
          console.error(
            "[Bulk Upload] Failed to send consolidated email:",
            emailErr,
          );
        }

        // Complete job
        await BulkUploadJobService.completeJob(jobId, {
          successCount: results.length,
          failCount: errors.length,
          errors: errors,
          successFile: successFileBase64
            ? {
                filename: `teacher_credentials_${getISTDateString()}.xlsx`,
                base64: successFileBase64,
                mimeType:
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              }
            : undefined,
          errorFile: errorFileBase64
            ? {
                filename: `teacher_upload_errors_${getISTDateString()}.xlsx`,
                base64: errorFileBase64,
                mimeType:
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              }
            : undefined,
        });
      } catch (error: any) {
        await BulkUploadJobService.failJob(
          jobId,
          error.message || "Failed to process bulk upload",
        );
      }
    })();

    // Return job ID immediately
    return res.status(202).json({
      success: true,
      message: "Bulk upload job created",
      data: { jobId },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      // Group errors by record index
      const errorsByRecord = new Map<number, any[]>();
      const originalData = Array.isArray(req.body) ? req.body : [];

      error.errors.forEach((err: any) => {
        const recordIndex = typeof err.path[0] === "number" ? err.path[0] : 0;
        if (!errorsByRecord.has(recordIndex)) {
          errorsByRecord.set(recordIndex, []);
        }
        errorsByRecord.get(recordIndex)!.push(err);
      });

      // Generate error Excel file
      const errorData = Array.from(errorsByRecord.entries()).map(
        ([index, errors]) => {
          const record = originalData[index] || {};
          const errorMessages = errors
            .map((err: any) => {
              const fieldPath =
                err.path.slice(1).join(".") ||
                err.path[0]?.toString() ||
                "unknown";
              return `${fieldPath}: ${err.message}`;
            })
            .join("; ");

          return {
            "Row Number": index + 2,
            "Teacher Name": record.name || record["Full Name"] || record["Teacher Name"] || "N/A",
            "Teacher Email": record.email || record["Email Address"] || "N/A",
            "Error Messages": errorMessages,
          };
        },
      );

      let errorFileBase64 = null;
      if (errorData.length > 0) {
        const errorWs = XLSX.utils.json_to_sheet(errorData);
        const errorWb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(errorWb, errorWs, "Validation Errors");
        const errorBuffer = XLSX.write(errorWb, {
          type: "buffer",
          bookType: "xlsx",
        });
        errorFileBase64 = errorBuffer.toString("base64");
      }

      // Format Zod validation errors into a readable message
      const errorMessages = error.errors.map((err: any) => {
        const path = err.path.join(".");
        return `${path}: ${err.message}`;
      });
      const errorMessage =
        errorMessages.length > 0
          ? `Validation failed: ${errorMessages.join("; ")}`
          : "Validation failed. Please check your data format.";

      return res.status(400).json({
        error: errorMessage,
        details: error.errors,
        errorFile: errorFileBase64
          ? {
              filename: `validation_errors_${getISTDateString()}.xlsx`,
              base64: errorFileBase64,
              mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }
          : undefined,
      });
    }
    console.error("Bulk Teacher Upload Error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to bulk upload teachers" });
    }
    res.end();
  }
}

