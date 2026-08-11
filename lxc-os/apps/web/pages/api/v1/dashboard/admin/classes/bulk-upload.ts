import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { bulkClassUploadSchema } from "@/lib/validations/admin/educational";
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
    const validatedData = bulkClassUploadSchema.parse(req.body);
    const totalItems = validatedData.length;

    // Create job and return job ID immediately
    const jobId = await BulkUploadJobService.createJob(
      "classes",
      totalItems,
      user.schoolId,
    );
    console.log(`[Bulk Upload] Created job ${jobId} for ${totalItems} items`);

    // Process asynchronously
    (async () => {
      try {
        const results = [];
        const errors: any[] = [];

        for (let i = 0; i < totalItems; i++) {
          const cls = validatedData[i];
          try {
            const createdClass = await prisma.class.upsert({
              where: {
                schoolId_name: {
                  schoolId: user.schoolId as string,
                  name: cls.className,
                },
              },
              update: {
                capacity: cls.capacity,
                roomNumber: cls.roomNumber,
                Section: {
                  deleteMany: {},
                  create:
                    cls.sections?.map((sec) => ({
                      name: sec.name,
                      capacity: sec.capacity,
                    })) || [],
                },
              },
              create: {
                name: cls.className,
                capacity: cls.capacity,
                roomNumber: cls.roomNumber,
                schoolId: user.schoolId as string,
                Section: {
                  create:
                    cls.sections?.map((sec) => ({
                      name: sec.name,
                      capacity: sec.capacity,
                    })) || [],
                },
              },
              include: { Section: true },
            });
            results.push(createdClass);
          } catch (itemError: any) {
            console.error(
              `Error processing class ${cls.className}:`,
              itemError,
            );
            errors.push({
              rowNumber: i + 2,
              className: cls.className || "N/A",
              capacity: cls.capacity || "N/A",
              roomNumber: cls.roomNumber || "N/A",
              sections: cls.sections
                ? cls.sections.map((s: any) => s.name).join(", ")
                : "N/A",
              errorMessage: itemError.message || "Unknown error occurred",
              errorDetails: itemError.stack
                ? itemError.stack.split("\n")[0]
                : undefined,
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
            "Class Name": error.className,
            Capacity: error.capacity,
            "Room Number": error.roomNumber,
            Sections: error.sections,
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

        // Complete job
        await BulkUploadJobService.completeJob(jobId, {
          successCount: results.length,
          failCount: errors.length,
          errors: errors,
          errorFile: errorFileBase64
            ? {
                filename: `classes_upload_errors_${getISTDateString()}.xlsx`,
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
    // If headers haven't been sent yet, we can send a 500.
    // Otherwise, the error should have been streamed.
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to bulk upload classes" });
    }
    res.end();
  }
}
