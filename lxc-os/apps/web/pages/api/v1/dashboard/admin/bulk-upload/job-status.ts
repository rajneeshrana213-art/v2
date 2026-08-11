import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { cors } from "@/lib/middleware/cors";
import { BulkUploadJobService } from "@/lib/services/bulk-upload-job-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await cors(req, res);

  const authResult = await verifyAuth(req, res);
  if (!authResult) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Disable caching for job status endpoint
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const { jobId } = req.query;

    if (!jobId || typeof jobId !== "string") {
      return res.status(400).json({ error: "Job ID is required" });
    }

    console.log(`[Job Status] Looking for job ${jobId}`);
    const job = await BulkUploadJobService.getJob(jobId);

    if (!job) {
      console.error(`[Job Status] Job ${jobId} not found`);
      return res.status(404).json({
        error: "Job not found",
        jobId,
        hint: "This may occur if the server restarted or the job was created in a different serverless instance",
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    console.error(`[Job Status] Error for job ${req.query.jobId}:`, error);
    return res
      .status(500)
      .json({ 
        error: "Failed to get job status", 
        message: error.message || "Unknown error",
        hint: "This may occur under heavy database load or connection pool exhaustion." 
      });
  }
}
