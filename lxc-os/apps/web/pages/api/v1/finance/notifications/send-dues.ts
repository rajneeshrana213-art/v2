import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { WhatsAppNotificationService } from "@/lib/services/finance/WhatsAppNotificationService";
import { getMSG91Config } from "@/lib/services/msg91-service";
import {
  sendDuesNotificationSchema,
  sendBulkDuesNotificationSchema,
} from "@/lib/validations/finance";
import { verifyAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { schoolId, academicYearId, bulk } = req.body;
    const config = getMSG91Config();

    if (!schoolId || !academicYearId) {
      return res
        .status(400)
        .json({ error: "School ID and Academic Year ID are required" });
    }

    if (bulk) {
      // Bulk Notification
      const result = sendBulkDuesNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      // Create a job for bulk notification
      const {
        BulkUploadJobService,
      } = require("@/lib/services/bulk-upload-job-service");
      const totalItems = await prisma.student.count({
        where: { schoolId, status: "ACTIVE" },
      });
      const jobId = await BulkUploadJobService.createJob(
        "students",
        totalItems,
        schoolId,
      );

      // Trigger async background job
      (async () => {
        try {
          const config = getMSG91Config();
          const { sent, failed } =
            await WhatsAppNotificationService.sendBulkFeeDueReminders(
              schoolId,
              academicYearId,
              config!,
              jobId,
            );

          await BulkUploadJobService.completeJob(jobId, {
            successCount: sent,
            failCount: failed,
            errors: [],
          });
        } catch (error: any) {
          console.error("[Bulk Notification] Job failed:", error);
          await BulkUploadJobService.failJob(
            jobId,
            error.message || "Bulk notification failed",
          );
        }
      })();

      return res.status(202).json({
        success: true,
        message: "Bulk notification job created",
        data: { jobId },
      });
    } else {
      // Single Notification
      const result = sendDuesNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const { studentId } = result.data;

      await WhatsAppNotificationService.sendFeeDueReminder(
        schoolId,
        academicYearId,
        studentId,
        config,
      );

      return res.status(200).json({ message: "Notification sent" });
    }
  } catch (error: any) {
    console.error("Notification API Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
