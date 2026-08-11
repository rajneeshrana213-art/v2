import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Public endpoint: intentionally accessible without session authentication.
// Candidates submit job applications without requiring an account so that
// the hiring process is open to all applicants.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { jobId, fullName, email, phone, resumeUrl, coverLetter } = req.body;

    if (!jobId || !fullName || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        fullName,
        email,
        phone,
        resumeUrl,
        coverLetter,
      },
    });

    return res
      .status(201)
      .json({
        message: "Application submitted successfully",
        id: application.id,
      });
  } catch (error: any) {
    console.error("Application submission error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
