import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { bulkSubjectUploadSchema } from "@/lib/validations/admin/educational";
import { BulkUploadJobService } from "@/lib/services/bulk-upload-job-service";
import * as XLSX from "xlsx";
import { getISTDateString } from "@/lib/utils/date-utils";

export const config = {
  api: {
    bodyParser: true,
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
    const validatedData = bulkSubjectUploadSchema.parse(req.body);
    const totalItems = validatedData.length;

    // Create job and return job ID immediately
    const jobId = await BulkUploadJobService.createJob(
      "subjects",
      totalItems,
      user.schoolId,
    );

    // Process asynchronously
    (async () => {
      try {
        const results = [];
        const errors: any[] = [];

        // Pre-fetch classes to avoid repeated queries
        const classes = await prisma.class.findMany({
          where: { schoolId: user.schoolId as string },
          select: { id: true, name: true },
        });

        const classMap = new Map(
          classes.map((c) => [c.name.toLowerCase(), c.id]),
        );

        for (let i = 0; i < totalItems; i++) {
          const item = validatedData[i];
          try {
            const classId = classMap.get(item.className.toLowerCase());
            if (!classId) {
              throw new Error(`Class "${item.className}" not found`);
            }

            const subject = await prisma.subject.upsert({
              where: {
                classId_name: {
                  classId: classId,
                  name: item.name,
                },
              },
              update: {
                code: item.code,
                type: item.type,
              },
              create: {
                name: item.name,
                code: item.code,
                type: item.type,
                classId: classId,
                schoolId: user.schoolId as string,
              },
            });
            results.push(subject);
          } catch (itemError: any) {
            console.error(
              `Error processing subject ${item.name}:`,
              itemError.message,
            );
            errors.push({
              rowNumber: i + 2,
              subjectName: item.name || "N/A",
              className: item.className || "N/A",
              subjectCode: item.code || "N/A",
              subjectType: item.type || "N/A",
              errorMessage: itemError.message || "Unknown error occurred",
            });
          }

          // Update progress
          await BulkUploadJobService.updateProgress(
            jobId,
            i + 1,
            results.length,
            errors.length,
          );
        }

        // Generate error file if there are errors
        let errorFileBase64 = null;
        if (errors.length > 0) {
          const errorData = errors.map((error) => ({
            "Row Number": error.rowNumber,
            "Subject Name": error.subjectName,
            "Class Name": error.className,
            "Subject Code": error.subjectCode,
            "Subject Type": error.subjectType,
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

        // Complete job
        await BulkUploadJobService.completeJob(jobId, {
          successCount: results.length,
          failCount: errors.length,
          errors: errors,
          errorFile: errorFileBase64
            ? {
                filename: `subjects_upload_errors_${getISTDateString()}.xlsx`,
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
    if (error.name === "ZodError")
      return res.status(400).json({ error: error.errors });
    console.error("Bulk Upload Error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to bulk upload subjects" });
    }
    res.end();
  }
}
