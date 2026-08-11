import { prisma } from "@/lib/prisma";

export interface BulkUploadJob {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: {
    current: number;
    total: number;
    percentage: number;
    successCount: number;
    failCount: number;
  };
  result?: {
    successCount: number;
    failCount: number;
    errors: any[];
    successFile?: {
      filename: string;
      base64: string;
      mimeType: string;
    };
    errorFile?: {
      filename: string;
      base64: string;
      mimeType: string;
    };
  };
  error?: string;
  schoolId?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BulkUploadJobService {
  static async createJob(
    type: string,
    total: number,
    schoolId?: string,
    createdById?: string,
  ): Promise<string> {
    const job = await prisma.bulkUploadJob.create({
      data: {
        type,
        status: "pending",
        progress: {
          current: 0,
          total,
          percentage: 0,
          successCount: 0,
          failCount: 0,
        },
        schoolId,
        createdById,
      },
    });

    console.log(`[JobService] Created persistent job ${job.id}`);
    return job.id;
  }

  static async getJob(jobId: string): Promise<BulkUploadJob | null> {
    const job = await prisma.bulkUploadJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        type: true,
        status: true,
        progress: true,
        error: true,
        schoolId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        result: true, // Included for debugging errors
      }
    });

    if (!job) return null;

    return {
      ...job,
      status: job.status as any,
      progress: job.progress as any,
    } as BulkUploadJob;
  }

  static async updateProgress(
    jobId: string,
    current: number,
    successCount: number,
    failCount: number,
  ): Promise<void> {
    const job = await prisma.bulkUploadJob.findUnique({
      where: { id: jobId },
      select: { progress: true },
    });

    if (!job) return;

    const progress = job.progress as any;
    const total = progress.total;

    try {
      await prisma.bulkUploadJob.update({
        where: { id: jobId },
        data: {
          status: "processing",
          progress: {
            current,
            total,
            percentage: Math.round((current / total) * 100),
            successCount,
            failCount,
          },
        },
      });
    } catch (dbError) {
      console.error(`[JobService] Failed to update progress for job ${jobId}:`, dbError);
      // We don't throw here to avoid crashing the bulk upload process just because
      // a progress update failed (e.g., due to connection pool contention)
    }
  }

  static async completeJob(
    jobId: string,
    result: BulkUploadJob["result"],
  ): Promise<void> {
    await prisma.bulkUploadJob.update({
      where: { id: jobId },
      data: {
        status: "completed",
        result: result as any,
      },
    });
  }

  static async failJob(jobId: string, error: string): Promise<void> {
    await prisma.bulkUploadJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        error: error,
      },
    });
  }

  static async deleteJob(jobId: string): Promise<void> {
    await prisma.bulkUploadJob.delete({
      where: { id: jobId },
    });
  }

  static async cleanupOldJobs(): Promise<void> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.bulkUploadJob.deleteMany({
      where: {
        updatedAt: {
          lt: oneDayAgo,
        },
      },
    });
  }
}
