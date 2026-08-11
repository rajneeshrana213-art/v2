import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { bulkStudentUploadSchema } from "@/lib/validations/admin/registration";
import { StudentCreationService } from "@/lib/services/common/StudentCreationService";
import { BulkUploadJobService } from "@/lib/services/bulk-upload-job-service";
import * as XLSX from "xlsx";
import { renderAndSendEmail } from "@/lib/utils/mailer";
import { SubscriptionService } from "@/lib/services/superadmin/SubscriptionService";
import { BulkUploadFactory } from "@/lib/services/common/BulkUploadFactory";
import { StudentBulkUploadFactory } from "@/lib/services/common/StudentBulkUploadFactory";
import { getISTDateString } from "@/lib/utils/date-utils";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

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
    // Fetch all classes and their sections for the school to map names to IDs
    const allClasses = await prisma.class.findMany({
      where: { schoolId: user.schoolId },
      select: { 
        id: true, 
        name: true,
        Section: {
          select: { id: true, name: true }
        }
      },
    });

    // Create maps for case-insensitive class and section name lookup
    const classMap = new Map<string, any>();
    allClasses.forEach((cls) => {
      const normalizedName = cls.name.trim().toLowerCase();
      const sectionMap = new Map<string, string>();
      cls.Section.forEach(sec => {
        sectionMap.set(sec.name.trim().toLowerCase(), sec.id);
      });
      classMap.set(normalizedName, { id: cls.id, sections: sectionMap });
    });

    // Add schoolId, address, and map className/section to IDs
    const dataWithSchoolId = Array.isArray(req.body)
      ? req.body.map((item: any) => {
          // Robust header lookup
          const getFieldValue = (keys: string[]) => {
            const foundKey = Object.keys(item).find(k => 
              keys.some(key => key.toLowerCase() === k.toLowerCase().trim())
            );
            return foundKey ? item[foundKey] : undefined;
          };

          const rawClassName = getFieldValue(["className", "Class", "Class Name", "Grade"]) || "";
          const normalizedClassName = rawClassName.toString().trim().toLowerCase();
          const classData = normalizedClassName ? classMap.get(normalizedClassName) : null;
          
          let classId = getFieldValue(["classId", "Class ID"]) || classData?.id || null;
          let sectionId = getFieldValue(["sectionId", "Section ID"]);
          const sectionName = getFieldValue(["section", "Section Name", "Sec"]);

          if (classData && !sectionId && sectionName) {
            const normalizedSectionName = sectionName.toString().trim().toLowerCase();
            sectionId = classData.sections.get(normalizedSectionName) || 
                       classData.sections.get(normalizedSectionName.replace(/^section\s+/i, "")) ||
                       null;
          }

          return {
            ...item,
            schoolId: item.schoolId || user.schoolId,
            // Consolidate parent/guardian details consistent with manual registration API
            fatherName: item.fatherName || item.guardianName || "Not Provided",
            fatherPhone:
              item.fatherPhone || item.guardianPhone || "Not Provided",
            fatheremail:
              item.fatheremail ||
              (item.guardianRelation === "Father" ? item.guardianEmail : ""),
            fatherOccupation: item.fatherOccupation || "Not Specified",
            motherName:
              item.motherName ||
              (item.guardianRelation === "Mother"
                ? item.guardianName
                : "Not Provided"),
            motherPhone:
              item.motherPhone ||
              (item.guardianRelation === "Mother"
                ? item.guardianPhone
                : "Not Provided"),
            motherOccupation: item.motherOccupation || "Not Specified",
            guardianOccupation: item.guardianOccupation || "Not Specified",
            guardianAddress:
              item.guardianAddress ||
              item.currentAddress ||
              item.address ||
              "Not Provided",

            // Defaults for other required fields not in simplified form/template
            primaryContact: item.primaryContact || item.phone || "Not Provided",
            Religion: item.Religion || "Not Specified",
            bloodType: item.bloodType || "Not Specified",
            category: item.category || "General",
            caste: item.caste || "Not Specified",
            motherTongue: item.motherTongue || "Not Specified",
            languagesKnown: item.languagesKnown || "Not Specified",
            areSiblingStudying: item.areSiblingStudying || "No",
            siblingName: item.siblingName || "N/A",
            siblingClass: item.siblingClass || "N/A",
            siblingRollNo: item.siblingRollNo || "N/A",
            siblingAdmissionNo: item.siblingAdmissionNo || "N/A",
            currentAddress:
              item.currentAddress || item.address || "Not Provided",
            permanentAddress:
              item.permanentAddress ||
              item.currentAddress ||
              item.address ||
              "Not Provided",
            medicalCondition: item.medicalCondition || "None",
            allergies: item.allergies || "None",
            medicationName: item.medicationName || "None",
            address: item.address || item.currentAddress || "Not Provided",
            city: item.city || "Not Provided",
            state: item.state || "Not Provided",
            country: item.country || "India",
            pincode: item.pincode || "000000",
            sectionId: sectionId || item.sectionId,
            section: item.section || sectionId || item.sectionId,
            classId: classId || item.classId,
            className: rawClassName || null,
            admissionNo: item.admissionNo || item.admissionNumber || item.adNo || item.admission_no || item.AdmissionNumber || item["Admission Number"] || undefined,
          };
        })
      : {
          ...req.body,
          schoolId: req.body.schoolId || user.schoolId,
          fatherName:
            req.body.fatherName || req.body.guardianName || "Not Provided",
          fatherPhone:
            req.body.fatherPhone || req.body.guardianPhone || "Not Provided",
          fatheremail:
            req.body.fatheremail ||
            (req.body.guardianRelation === "Father"
              ? req.body.guardianEmail
              : ""),
          fatherOccupation: req.body.fatherOccupation || "Not Specified",
          motherName:
            req.body.motherName ||
            (req.body.guardianRelation === "Mother"
              ? req.body.guardianName
              : "Not Provided"),
          motherPhone:
            req.body.motherPhone ||
            (req.body.guardianRelation === "Mother"
              ? req.body.guardianPhone
              : "Not Provided"),
          motherOccupation: req.body.motherOccupation || "Not Specified",
          guardianOccupation: req.body.guardianOccupation || "Not Specified",
          guardianAddress:
            req.body.guardianAddress ||
            req.body.currentAddress ||
            req.body.address ||
            "Not Provided",
          address:
            req.body.address || req.body.currentAddress || "Not Provided",
          classId:
            req.body.classId ||
            (req.body.className
              ? classMap.get(
                  req.body.className.toString().trim().toLowerCase(),
                )?.id || null
              : null),
          sectionId:
            req.body.sectionId ||
            (req.body.section && req.body.className
              ? classMap.get(
                  req.body.className.toString().trim().toLowerCase(),
                )?.sections?.get(req.body.section.toString().trim().toLowerCase()) || null
              : null),
        };

    console.log(
      `[Bulk Upload] Starting bulk upload for ${Array.isArray(req.body) ? req.body.length : 1} students`,
    );
    console.log(
      `[Bulk Upload] Sample data (first record):`,
      Array.isArray(dataWithSchoolId) && dataWithSchoolId.length > 0
        ? {
            name: dataWithSchoolId[0].name,
            email: dataWithSchoolId[0].email,
            className: dataWithSchoolId[0].className,
            classId: dataWithSchoolId[0].classId,
            phone: dataWithSchoolId[0].phone,
            schoolId: dataWithSchoolId[0].schoolId,
          }
        : dataWithSchoolId,
    );

    const validatedData = bulkStudentUploadSchema.parse(dataWithSchoolId);
    const totalItems = validatedData.length;

    // Phase 1 & 2: Pre-fetch and First Pass Validation (Synchronous for early error reporting)
    const metadata = await BulkUploadFactory.prefetchMetadata(user.schoolId);
    const { validRows, failedRows: validationErrors } = StudentBulkUploadFactory.validateRows(validatedData as any, metadata);

    // If everything failed validation, return error immediately
    if (validRows.length === 0 && validationErrors.length > 0) {
      return res.status(400).json({
        error: "All records failed validation. Please check the error report.",
        details: validationErrors,
        failedCount: validationErrors.length,
      });
    }

    // Pre-check student limit (Phase 2 Continued)
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

    // Create job and return job ID immediately
    const jobId = await BulkUploadJobService.createJob(
      "students",
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

        await BulkUploadFactory.processChunksParallel(chunks, 3, async (chunk, chunkIndex) => {
          const { results, errors } = await StudentBulkUploadFactory.processChunk(
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

        // Use the combined results for formatting (Phase 9)
        const results = finalResults;
        const errors = finalErrors;

        // Generate Excel files
        let successFileBase64 = null;
        let errorFileBase64 = null;

        if (results.length > 0) {
          const successData = results.map((res, idx) => ({
            "S.No": idx + 1,
            "School Name": res.schoolName || metadata.schoolName || "N/A",
            "Student Name": res.studentUser?.name || "N/A",
            "Student Email": res.studentUser?.email || "N/A",
            "Class": res.className || "N/A",
            "Parent Name": res.parentUser?.name || "N/A",
            "Parent Email": res.parentUser?.email || "N/A",
            "Guardian Name": res.student?.guardianName || "N/A",
            "Admission No": res.student?.admissionNo || "N/A",
            Username: res.studentUserName || "N/A",
            Password: res.tempStudentPassword || "N/A",
            "Parent Username": res.parentUserName || "N/A",
            "Parent Password": res.tempParentPassword || "Already Exists",
          }));

          const successWs = XLSX.utils.json_to_sheet(successData);
          const successWb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(
            successWb,
            successWs,
            "Student Credentials",
          );
          const successBuffer = XLSX.write(successWb, {
            type: "buffer",
            bookType: "xlsx",
          });
          successFileBase64 = successBuffer.toString("base64");
        }

        if (errors.length > 0) {
          const errorData = errors.map((error) => ({
            "Row Number": error.index ? error.index + 2 : (error.rowNumber || "N/A"),
            "Student Name": error.studentName || error.name || "N/A",
            "Student Email": error.studentEmail || "N/A",
            "Error Message": error.errorMessage,
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

        // Send consolidated email
        try {
          const istDateKey = getISTDateString();
          const emailAttachments: any[] = [];
          if (successFileBase64) {
            emailAttachments.push({
              filename: `student_credentials_${istDateKey}.xlsx`,
              content: Buffer.from(successFileBase64, "base64"),
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
          }
          if (errorFileBase64) {
            emailAttachments.push({
              filename: `upload_errors_${istDateKey}.xlsx`,
              content: Buffer.from(errorFileBase64, "base64"),
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
          }

          if (emailAttachments.length > 0) {
            await renderAndSendEmail(
              "bulk-upload-results",
              {
                uploadType: "Students",
                totalItems: totalItems,
                successCount: results.length,
                failedCount: errors.length,
              },
              "Bulk Upload Results - Students",
              `${user.email}, credentialslxc@gmail.com`,
              { attachments: emailAttachments },
            );
          }
        } catch (emailErr) {
          console.error("[Bulk Upload] Email failed:", emailErr);
        }

        // Complete job
        await BulkUploadJobService.completeJob(jobId, {
          successCount: results.length,
          failCount: errors.length,
          errors: errors,
          successFile: successFileBase64
            ? {
                filename: `student_credentials_${getISTDateString()}.xlsx`,
                base64: successFileBase64,
                mimeType:
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              }
            : undefined,
          errorFile: errorFileBase64
            ? {
                filename: `upload_errors_${getISTDateString()}.xlsx`,
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
      // Group errors by record index (first element of path array)
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
            "Row Number": index + 2, // +2 because Excel rows start at 1, and row 1 is header
            "Student Name": record.name || "N/A",
            "Student Email": record.email || "N/A",
            Phone: record.phone || "N/A",
            "Class Name": record.className || "N/A",
            "Error Messages": errorMessages,
            "All Errors": JSON.stringify(
              errors.map((e: any) => ({
                field: e.path.join("."),
                message: e.message,
                code: e.code,
              })),
            ),
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
    console.error("Bulk Student Upload Error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to bulk upload students" });
    }
    res.end();
  }
}
